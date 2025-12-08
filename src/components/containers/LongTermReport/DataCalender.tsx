import {
  BodyBloodPressureSamples,
  BodyMeasurementsSamples,
  DailyActiveDurationsSummary,
  DailyDistanceSummary,
  DailyHeartRateSummary,
  DailyOxygenSummary,
  DataSummary,
  MetricKey,
  SelfReportedSymptoms,
  SleepBreathsSummary,
  SleepSummary,
  Thresholds,
} from '@/src/constants/types'
import { cellClassName, flattenArray, getFormattedDate } from '../../../lib/cellClassNames'
import { useTranslation } from 'react-i18next'
import Calendar from 'rsuite/Calendar'
import 'rsuite/Calendar/styles/index.css'
import '../../../styles/CalendarCustomStyle.css'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../ui/hover-card'
import { useEffect, useRef, useState } from 'react'
import { Checkbox } from '../../ui/checkbox'
import { Badge } from '../../ui/badge'
import { CalendarIcon, TextAlignJustifyIcon, CheckIcon } from '@radix-ui/react-icons'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../../components/ui/ThresholdsDialog'
import ThresholdForm from './ThresholdsForm'
import { Timestamp } from 'firebase/firestore'
import { useLogSnag } from '@logsnag/react'

interface DataCalenderProps {
  data: DataSummary
  id?: string
  url: string
  accessRequestId?: string
  decryptedRequestId?: string
}

export const DataCalender = ({
  data,
  id,
  url,
  accessRequestId,
  decryptedRequestId,
}: DataCalenderProps) => {
  const [translation] = useTranslation('global')
  const [thresholds, setThresholds] = useState<Thresholds>({
    steps: { low: 5000 },
    sleepDuration: { optimal: [7, 9] },
    avgHeartRate: { optimal: [60, 100] },
    avgWeight: { optimal: [0, 500] },
    avgBreaths: { optimal: [12, 20] },
    avgSaturation: { low: 97 },
    bloodPressureSys: { optimal: [70, 100] },
    bloodPressureDys: { optimal: [130, 160] },
    activeMinutes: { low: 90 },
    selfReportedSymptom: { low: 0 },
  })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthData, setMonthData] = useState<DataSummary | null>(null)
  const { track } = useLogSnag()

  useEffect(() => {
    const disableButton = () => {
      const button = document.querySelector('.rs-calendar-header-title')
      if (button) {
        button.removeAttribute('aria-label')
        button.setAttribute('disabled', 'true')
      }
    }
    disableButton()
  }, [])

  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([
    'steps',
    'sleepDuration',
    'avgHeartRate',
    'selfReportedSymptom',
  ])

  const metricDisplayNames: Record<MetricKey, string> = {
    steps: translation('LongTermReportPage.metric_display_steps'),
    sleepDuration: translation('LongTermReportPage.metric_display_sleep_duration'),
    avgHeartRate: translation('LongTermReportPage.metric_display_avg_heart_rate'),
    avgBreaths: translation('LongTermReportPage.metric_display_respiration'),
    avgSaturation: translation('LongTermReportPage.metric_display_saturation'),
    avgWeight: translation('LongTermReportPage.metric_display_weight'),
    bloodPressureSys: translation('LongTermReportPage.metric_display_blood_pressure_systolic'),
    bloodPressureDys: translation('LongTermReportPage.metric_display_blood_pressure_diastolic'),
    activeMinutes: translation('LongTermReportPage.metric_display_active_minutes'),
    selfReportedSymptom: '',
  }

  const metricGoals: Record<MetricKey, string> = {
    steps: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.steps?.low} ${translation('LongTermReportPage.metric_display_steps').toLowerCase()}`,
    sleepDuration: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.sleepDuration?.optimal[0]} - ${thresholds?.sleepDuration?.optimal[1]} ${translation('LongTermReportPage.hours').toLowerCase()}`,
    avgHeartRate: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.avgHeartRate?.optimal[0]} - ${thresholds?.avgHeartRate?.optimal[1]} ${translation('LongTermReportPage.bpm').toLowerCase()}`,
    avgBreaths: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.avgBreaths?.optimal[0]} - ${thresholds?.avgBreaths?.optimal[1]} ${translation('LongTermReportPage.breaths_per_minute').toLowerCase()}`,
    avgSaturation: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.avgSaturation?.low}% `,
    avgWeight: `${translation('LongTermReportPage.no_threshold')}`,
    bloodPressureSys: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.bloodPressureSys?.optimal[0]} - ${thresholds?.bloodPressureSys?.optimal[1]} mmHg`,
    bloodPressureDys: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.bloodPressureDys?.optimal[0]} - ${thresholds?.bloodPressureDys?.optimal[1]} mmHg`,
    activeMinutes: `${translation('LongTermReportPage.threshold_text')} ${thresholds?.activeMinutes?.low} ${translation('LongTermReportPage.minutes').toLowerCase()} `,
    selfReportedSymptom: '',
  }

  const handleCheckboxChange = (metric: MetricKey) => {
    setSelectedMetrics((prev) => {
      const updatedMetrics = prev.includes(metric)
        ? prev.filter((m) => m !== metric)
        : [...prev, metric]
      return updatedMetrics
    })
  }

  const handleThresholdChange = (
    metric: MetricKey,
    key: string,
    value: number | [number, number]
  ) => {
    setThresholds((prevThresholds) => ({
      ...prevThresholds,
      [metric]: {
        ...(prevThresholds[metric] || {}),
        [key]: value,
      },
    }))
    track({
      channel: 'clicks',
      event: 'The user has applied the thresholds.',
      icon: '👆',
    })
  }

  const handleThresholdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  useEffect(() => {
    const loadDataForMultipleMonths = (date: Date) => {
      const getMonthRange = (monthOffset: number) => {
        const adjustedDate = new Date(date.getFullYear(), date.getMonth() + monthOffset, 1)
        const monthStart = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth(), 1)
        const monthEnd = new Date(adjustedDate.getFullYear(), adjustedDate.getMonth() + 1, 0)
        return { monthStart, monthEnd }
      }

      const currentMonthRange = getMonthRange(0)
      const previousMonthRange = getMonthRange(-1)
      const nextMonthRange = getMonthRange(1)

      const flattenAndFilter = <T,>(data: T[][], filterFn: (item: T) => boolean): T[] => {
        return data.flat().filter(filterFn)
      }

      const filterByRange = (itemDate: Date, ranges: { monthStart: Date; monthEnd: Date }[]) => {
        return ranges.some((range) => itemDate >= range.monthStart && itemDate <= range.monthEnd)
      }

      const ranges = [previousMonthRange, currentMonthRange, nextMonthRange]

      const filteredData: any = {
        dailyActiveDurationsSummary: flattenAndFilter(
          data.dailyActiveDurationsSummary,
          (d: DailyActiveDurationsSummary) => filterByRange(new Date(d.start_time), ranges)
        ),
        dailyDistanceSummary: flattenAndFilter(
          data.dailyDistanceSummary,
          (d: DailyDistanceSummary) => filterByRange(new Date(d.start_time), ranges)
        ),
        dailyHeartRateSummary: flattenAndFilter(
          data.dailyHeartRateSummary,
          (d: DailyHeartRateSummary) => filterByRange(new Date(d.start_time), ranges)
        ),
        sleepSummary: flattenAndFilter(data.sleepSummary, (d: SleepSummary) =>
          filterByRange(new Date(d.end_time), ranges)
        ),
        bodyMeasurementsSamples: flattenAndFilter(
          data.bodyMeasurementsSamples,
          (d: BodyMeasurementsSamples) => filterByRange(new Date(d.start_time), ranges)
        ),
        sleepBreathsSummary: flattenAndFilter(data.sleepBreathsSummary, (d: SleepBreathsSummary) =>
          filterByRange(new Date(d.end_time), ranges)
        ),
        dailyOxygenSummary: flattenAndFilter(data.dailyOxygenSummary, (d: DailyOxygenSummary) =>
          filterByRange(new Date(d.start_time), ranges)
        ),
        bodyBloodPressureSamples: flattenAndFilter(
          data.bodyBloodPressureSamples,
          (d: BodyBloodPressureSamples) => filterByRange(new Date(d.start_time), ranges)
        ),
        selfReportedSymptoms: flattenAndFilter(
          data.selfReportedSymptoms,
          (d: SelfReportedSymptoms) =>
            filterByRange(
              d.DateAndTime instanceof Timestamp
                ? d.DateAndTime.toDate()
                : new Date(d.DateAndTime._seconds * 1000),
              ranges
            )
        ),
      }
      setMonthData(filteredData)
    }

    loadDataForMultipleMonths(currentMonth)
  }, [currentMonth, data])

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date)
  }

  const trackClick = () => {
    track({
      channel: 'clicks',
      event: 'The user has opened the thresholds form',
      icon: '👆',
    })
  }

  const renderCell = (date: Date) => {
    if (!monthData) return null

    const formattedDate = getFormattedDate(date)
    const flatActiveDurationsData = flattenArray(monthData.dailyActiveDurationsSummary)
    const flatDistanceData = flattenArray(monthData.dailyDistanceSummary)
    const flatHeartRateData = flattenArray(monthData.dailyHeartRateSummary)
    const flatSleepData = flattenArray(monthData.sleepSummary)
    const flatWeightData = flattenArray(monthData.bodyMeasurementsSamples)
    const flatBreathsData = flattenArray(monthData.sleepBreathsSummary)
    const flatSaturationData = flattenArray(monthData.dailyOxygenSummary)
    const flatBloodPressureData = flattenArray(monthData.bodyBloodPressureSamples)
    const flatSelfReportedSymptoms = flattenArray(monthData.selfReportedSymptoms)

    const handleCardClick = async () => {
      const navigationURL = `${url}/${id}/${formattedDate}`
      if (url === '/quick-shared-report/daily' && decryptedRequestId) {
        const stateToSend = JSON.stringify(accessRequestId)
        const encodedState = encodeURIComponent(stateToSend)
        const encodedAccessRequestId = encodeURIComponent(decryptedRequestId)
        const encodedURL = `${url}/${id}/${formattedDate}?data=${encodedState}&src=${encodedAccessRequestId}`
        window.open(encodedURL, '_blank', 'noopener,noreferrer')
        track({
          channel: 'report-clicks',
          event: 'A daily sample page has been opened from a quick shared report.',
          icon: '📊',
        })
      } else {
        window.open(navigationURL, '_blank', 'noopener,noreferrer')
        track({
          channel: 'report-clicks',
          event: 'A daily sample page has been opened from a long term report.',
          icon: '📊',
        })
      }
    }

    const weightData = flatWeightData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const activeDurationsData = flatActiveDurationsData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const distanceData = flatDistanceData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const heartRateData = flatHeartRateData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const saturationData = flatSaturationData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const bloodPressureData = flatBloodPressureData.find(
      (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
    )
    const breathsData = flatBreathsData.find(
      (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
    )
    const SelfReportedSymptoms = flatSelfReportedSymptoms.find((d) => {
      const date =
        d.DateAndTime instanceof Timestamp
          ? d.DateAndTime.toDate()
          : new Date(d.DateAndTime._seconds * 1000)
      return getFormattedDate(date) === formattedDate
    })
    const sleepDataForDate = flatSleepData.filter(
      (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
    )
    const aggregatedSleepDuration = sleepDataForDate.reduce((total, current) => {
      return total + (current.duration_asleep_state_seconds || 0)
    }, 0)

    const steps = distanceData?.steps ?? null
    const avgWeight = weightData?.weight_kg ?? null
    const avgSaturationPercentage = saturationData?.avg_saturation_percentage ?? null
    const systolicBPs =
      bloodPressureData?.blood_pressure_samples.map((sample) => sample.systolic_bp) || []
    const diastolicBPs =
      bloodPressureData?.blood_pressure_samples.map((sample) => sample.diastolic_bp) || []
    const avgBreathsPerMin = breathsData?.avg_breaths_per_min ?? null
    const sleepDuration = aggregatedSleepDuration ? aggregatedSleepDuration / 3600 : null
    const activeMinutes = activeDurationsData?.activity_seconds
      ? activeDurationsData.activity_seconds / 60
      : null
    const avgHeartRate = heartRateData?.avg_hr_bpm ?? null
    const selfRreportedSymptom = SelfReportedSymptoms?.text ?? null
    const selfReportedSymptomTime = SelfReportedSymptoms
      ? SelfReportedSymptoms.DateAndTime instanceof Timestamp
        ? SelfReportedSymptoms.DateAndTime.toDate().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date(SelfReportedSymptoms.DateAndTime._seconds * 1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
      : null

    const allMetrics: Record<
      MetricKey,
      { label?: string; value: string | number | null; condition: boolean; time?: string | null }
    > = {
      steps: {
        label: translation('LongTermReportPage.metric_display_steps'),
        value: steps !== null ? steps.toFixed(0) : null,
        condition: thresholds.steps && steps !== null ? steps >= thresholds.steps.low : true,
      },
      selfReportedSymptom: {
        label: 'Self Rep. Symptom',
        time: selfReportedSymptomTime,
        value: selfRreportedSymptom,
        condition: thresholds.selfReportedSymptom && selfRreportedSymptom !== null ? false : true,
      },
      bloodPressureSys: {
        label: translation('LongTermReportPage.bp_systolic'),
        value: systolicBPs.length > 0 ? systolicBPs.join(', ') + ' mmHg' : null,
        condition:
          thresholds.bloodPressureSys !== undefined &&
          systolicBPs.every(
            (bp) =>
              bp >= (thresholds.bloodPressureSys?.optimal[0] ?? -Infinity) &&
              bp <= (thresholds.bloodPressureSys?.optimal[1] ?? Infinity)
          ),
      },
      bloodPressureDys: {
        label: translation('LongTermReportPage.bp_dystolic'),
        value: diastolicBPs.length > 0 ? diastolicBPs.join(', ') + ' mmHg' : null,
        condition:
          thresholds.bloodPressureDys !== undefined &&
          diastolicBPs.every(
            (bp) =>
              bp >= (thresholds.bloodPressureDys?.optimal[0] ?? -Infinity) &&
              bp <= (thresholds.bloodPressureDys?.optimal[1] ?? Infinity)
          ),
      },
      avgWeight: {
        label: translation('LongTermReportPage.metric_display_weight'),
        value: avgWeight !== null ? avgWeight.toFixed(1) + ' kg' : null,
        condition:
          thresholds.avgWeight && avgWeight !== null
            ? avgWeight >= thresholds.avgWeight?.optimal[0]
            : true,
      },
      avgBreaths: {
        label: translation('LongTermReportPage.respiration'),
        value: avgBreathsPerMin
          ? avgBreathsPerMin.toFixed(0) + ' ' + translation('LongTermReportPage.breaths_per_minute')
          : null,
        condition:
          thresholds.avgBreaths && avgBreathsPerMin !== null
            ? avgBreathsPerMin >= thresholds.avgBreaths.optimal[0] &&
              avgBreathsPerMin <= thresholds.avgBreaths.optimal[1]
            : true,
      },
      avgSaturation: {
        label: translation('LongTermReportPage.metric_display_saturation'),
        value: avgSaturationPercentage ? avgSaturationPercentage.toFixed(0) + '%' : null,
        condition:
          thresholds.avgSaturation && avgSaturationPercentage !== null
            ? Math.round(avgSaturationPercentage) >= thresholds.avgSaturation.low
            : true,
      },
      avgHeartRate: {
        label: translation('LongTermReportPage.metric_display_avg_heart_rate'),
        value: avgHeartRate ? avgHeartRate.toFixed(0) + ' bpm' : null,
        condition:
          thresholds.avgHeartRate && avgHeartRate !== null
            ? avgHeartRate >= thresholds.avgHeartRate.optimal[0] &&
              avgHeartRate <= thresholds.avgHeartRate.optimal[1]
            : true,
      },
      sleepDuration: {
        label: translation('LongTermReportPage.metric_display_sleep_duration'),
        value: sleepDuration
          ? `${Math.floor(sleepDuration)}h ${Math.floor((sleepDuration % 1) * 60)}m`
          : null,
        condition:
          thresholds.sleepDuration && sleepDuration !== null
            ? sleepDuration >= thresholds.sleepDuration.optimal[0] &&
              sleepDuration <= thresholds.sleepDuration.optimal[1]
            : true,
      },
      activeMinutes: {
        label: translation('LongTermReportPage.metric_display_active_minutes'),
        value: activeMinutes
          ? activeMinutes.toFixed(0) + ' ' + translation('LongTermReportPage.minutes_short')
          : null,
        condition:
          thresholds.activeMinutes && activeMinutes !== null
            ? activeMinutes >= thresholds.activeMinutes.low
            : true,
      },
    }

    const unmetMetrics = selectedMetrics
      .map((metric) => allMetrics[metric])
      .filter((metric) => metric.value !== null && !metric.condition)

    const hasSelectedMetricsData = selectedMetrics
      .map((metric) => allMetrics[metric].value !== null)
      .some((hasData) => hasData)

    if (!hasSelectedMetricsData) {
      return (
        <HoverCard>
          <HoverCardTrigger>
            <div className="flex h-full pt-8 pb-4 flex-col gap-1">
              <div>
                <p className="text-xs">{translation('LongTermReportPage.no_data')}</p>
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent
            side="right"
            sideOffset={-25}
            className="w-fit rounded-sm border-none shadow-lg hover:shadow-lg px-4 py-4"
          >
            <div className="text-left">
              <Badge variant={'outline'} className="text-xs font-normal mb-4 text-black py-1">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formattedDate}
              </Badge>
              <p className="text-xs md:text-sm font-normal">
                {translation('LongTermReportPage.no_data_available')}
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
      )
    }

    const allConditionsMet = selectedMetrics
      .map((metric) => allMetrics[metric].condition)
      .every((condition) => condition)

    return (
      <HoverCard>
        <HoverCardTrigger onClick={handleCardClick}>
          <div className="flex h-full flex flex-col gap-1 pt-6 pb-6" title="">
            {allConditionsMet ? (
              <div className="flex items-center justify-center">
                <CheckIcon color="#22c55e" className="w-8 h-8" />
              </div>
            ) : (
              unmetMetrics.map((item, index) => (
                <div key={index} className="" title="">
                  <p className="flex items-center justify-center text-xs md:text-xs">
                    {item.label === 'Self Rep. Symptom' && (
                      <span className="relative flex h-2 w-2 mx-2 ">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    )}
                    {item.label}
                  </p>
                </div>
              ))
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          side="right"
          sideOffset={-25}
          collisionPadding={50}
          className="w-fit rounded-sm border-none shadow-lg hover:shadow-lg px-6 py-6 mt-32"
          title=""
        >
          <div className="text-left">
            <Badge variant={'outline'} className="text-xs font-normal mb-6 text-black py-1">
              <CalendarIcon className="w-4 h-4 mr-2" />
              {formattedDate}
            </Badge>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-10 align-left" title="">
            {selectedMetrics
              .map((metric) => allMetrics[metric])
              .filter((item) => item.value !== null && item.value !== undefined)
              .map((item, index) =>
                item.label !== 'Self Rep. Symptom' ? (
                  <div key={index} className="">
                    <p className="text-xs text-left font-medium mb-1">{item.label}</p>
                    <p className="text-md text-left font-normal">{item.value}</p>
                  </div>
                ) : null
              )}
          </div>
          {selectedMetrics
            .map((metric) => allMetrics[metric])
            .filter((item) => item.value !== null && item.value !== undefined)
            .filter((item) => item.label === 'Self Rep. Symptom')
            .map((item, index) => (
              <div key={index} className="w-full mt-8 px-4 py-4 border rounded-sm bg-zinc-50">
                <p className="text-xs text-left font-medium mb-1">{item.label}</p>
                <p className="text-md text-left font-normal">{item.value}</p>
              </div>
            ))}
        </HoverCardContent>
      </HoverCard>
    )
  }
  return (
    <>
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between mb-8 md:mb-14">
          <div className="flex flex-col">
            <h1 className="text-lg font-normal text-black">
              {translation('LongTermReportPage.general_overview_heading')}
            </h1>
            <p className="text-sm font-normal text-slate-500">
              {translation('LongTermReportPage.general_overview_subheading')}
            </p>
          </div>
          <Dialog>
            <DialogTrigger>
              <span
                className="h-8 rounded-md px-3 text-xs border text-xs border-blue-600 bg-white text-blue-600 shadow-none hover:text-white hover:bg-blue-600 hover:border-blue-600 w-full md:w-fit inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                onClick={trackClick}
              >
                <TextAlignJustifyIcon className="w-4 h-4 mr-2" />
                {translation('LongTermReportPage.adjust_thresholds_button')}
              </span>
            </DialogTrigger>
            <DialogContent className="gap-12 max-h-[100vh] lg:max-h-[100vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-3xl font-medium text-left mb-1">
                  {translation('LongTermReportPage.adjust_thresholds_button')}
                </DialogTitle>
                <DialogDescription className="text-black text-md text-left mt-2">
                  {translation('LongTermReportPage.adjust_thresholds_subtext')}
                </DialogDescription>
              </DialogHeader>
              <ThresholdForm
                thresholds={thresholds}
                onThresholdChange={handleThresholdChange}
                onSubmit={handleThresholdSubmit}
              />
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-8 xl:gap-10 mb-4">
          {(
            [
              'steps',
              'sleepDuration',
              'avgHeartRate',
              'avgSaturation',
              'avgWeight',
              'avgBreaths',
              'bloodPressureSys',
              'bloodPressureDys',
              'activeMinutes',
            ] as MetricKey[]
          ).map((metric) => (
            <label
              key={metric}
              className="flex flex-row items-center gap-2 px-3 hover:cursor-pointer"
            >
              <Checkbox
                className="mb-3 bg-white border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                checked={selectedMetrics.includes(metric)}
                onCheckedChange={() => handleCheckboxChange(metric)}
              />
              <span className="flex flex-col">
                <p className="text-sm font-normal text-black">{metricDisplayNames[metric]}</p>
                <p className="text-xs text-gray-500">{metricGoals[metric]}</p>
              </span>
            </label>
          ))}
        </div>
      </div>
      <Calendar
        className="mt-6 border rounded-md"
        isoWeek
        cellClassName={(date) => cellClassName(date, monthData, thresholds, selectedMetrics)}
        renderCell={renderCell}
        onMonthChange={handleMonthChange}
      />
    </>
  )
}

export default DataCalender
