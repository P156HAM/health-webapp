import React, { useEffect, useState } from 'react'
// import { fetchPreventionPlans } from '../lib/firestore';
import {
  BodyBloodPressureSamples,
  BodyMeasurementsSamples,
  DailyActiveDurationsSummary,
  DailyDistanceSummary,
  DailyHeartRateSummary,
  DailyOxygenSummary,
  DataSummary,
  PreventionMetricKey,
  PreventionThresholds,
  SleepBreathsSummary,
  SleepHeartRateSummary,
  SleepSummary,
} from '@/src/constants/types'
import { flattenArray, getFormattedDate } from '../../../lib/cellClassNames'
import { useTranslation } from 'react-i18next'
import Calendar from 'rsuite/Calendar'
import 'rsuite/Calendar/styles/index.css'
import '../../../styles/CalendarCustomStyle.css'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../../ui/hover-card'
import { Badge } from '../../ui/badge'
import { CalendarIcon, CheckIcon } from '@radix-ui/react-icons'
import { PreventionCellClassNames } from '../../../lib/PreventionCellClassNames'

interface PreventionPlanCalenderProps {
  data: DataSummary
  id?: string
  preventionPlan?: {
    heading: string
    description: string
    bioMarkers: PreventionMetricKey[]
    PrevetionThresholds: PreventionThresholds
  }
}

const PreventionPlanCalender = ({ data, id, preventionPlan }: PreventionPlanCalenderProps) => {
  const [translation] = useTranslation('global')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [monthData, setMonthData] = useState<DataSummary | null>(null)
  const thresholds = preventionPlan?.PrevetionThresholds
  const bioMarkers = preventionPlan?.bioMarkers

  useEffect(() => {
    if (thresholds && bioMarkers && bioMarkers?.length > 0) {
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
          sleepBreathsSummary: flattenAndFilter(
            data.sleepBreathsSummary,
            (d: SleepBreathsSummary) => filterByRange(new Date(d.end_time), ranges)
          ),
          sleepHeartRateSummary: flattenAndFilter(
            data.sleepHeartRateSummary,
            (d: SleepHeartRateSummary) => filterByRange(new Date(d.end_time), ranges)
          ),
          dailyOxygenSummary: flattenAndFilter(data.dailyOxygenSummary, (d: DailyOxygenSummary) =>
            filterByRange(new Date(d.start_time), ranges)
          ),
        }
        setMonthData(filteredData)
      }

      loadDataForMultipleMonths(currentMonth)
    }
  }, [currentMonth, data, thresholds, bioMarkers])

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date)
  }

  const renderCell = (date: Date) => {
    if (!monthData || !thresholds || (bioMarkers && bioMarkers.length === 0)) return null

    const formattedDate = getFormattedDate(date)
    const flatDistanceData = flattenArray(monthData.dailyDistanceSummary)
    const flatHeartRateData = flattenArray(monthData.dailyHeartRateSummary)
    const flatSleepData = flattenArray(monthData.sleepSummary)
    const flatSleepHeartRateData = flattenArray(data.sleepHeartRateSummary)
    const flatWeightData = flattenArray(monthData.bodyMeasurementsSamples)
    const flatBreathsData = flattenArray(monthData.sleepBreathsSummary)
    const flatSaturationData = flattenArray(monthData.dailyOxygenSummary)

    const handleCardClick = () => {
      const url = `/report/daily/${id}/${formattedDate}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const weightData = flatWeightData.find(
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
    const breathsData = flatBreathsData.find(
      (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
    )
    const sleepHeartRateData = flatSleepHeartRateData.find(
      (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
    )
    const sleepDataForDate = flatSleepData.filter(
      (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
    )
    const aggregatedSleepDuration = sleepDataForDate.reduce((total, current) => {
      return total + (current.duration_asleep_state_seconds || 0)
    }, 0)

    const steps = distanceData?.steps ?? null
    const distance = distanceData?.distance_meters ?? null
    const avgWeight = weightData?.weight_kg ?? null
    const avgSaturationPercentage = saturationData?.avg_saturation_percentage ?? null
    const avgBreathsPerMin = breathsData?.avg_breaths_per_min ?? null
    const sleepDuration = aggregatedSleepDuration ? aggregatedSleepDuration / 3600 : null
    const avgHeartRate = heartRateData?.avg_hr_bpm ?? null
    const avg_hrv_rmssd = sleepHeartRateData?.avg_hrv_rmssd ?? null

    const allMetrics: Partial<
      Record<
        PreventionMetricKey,
        { label?: string; value: string | number | null; condition: boolean }
      >
    > = {
      steps: {
        label: translation('LongTermReportPage.metric_display_steps'),
        value: steps,
        condition: thresholds.steps && steps !== null ? steps >= thresholds.steps.low : true,
      },
      distance: {
        label: 'Distance',
        value: distance,
        condition:
          thresholds.distance && distance !== null ? distance >= thresholds.distance.low : true,
      },
      avgWeight: {
        label: translation('LongTermReportPage.metric_display_weight'),
        value: avgWeight !== null ? avgWeight + ' kg' : null,
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
      hrv: {
        label: 'Avg. HRV',
        value: avg_hrv_rmssd ? avg_hrv_rmssd.toFixed(0) + ' bpm' : null,
        condition:
          thresholds.hrv && avg_hrv_rmssd !== null
            ? avg_hrv_rmssd >= thresholds.hrv.optimal[0] &&
            avg_hrv_rmssd <= thresholds.hrv.optimal[1]
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
    }

    const unmetMetrics = bioMarkers
      ?.map((marker) => allMetrics[marker])
      .filter((marker) => marker?.value !== null && !marker?.condition)

    const hasSelectedMetricsData = bioMarkers
      ?.map((marker) => allMetrics[marker]?.value !== null)
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

    const allConditionsMet = bioMarkers
      ?.map((marker) => allMetrics[marker]?.condition)
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
              unmetMetrics?.map((item, index) => (
                <div key={index} className="" title="">
                  <p className="flex items-center justify-center text-xs md:text-xs">
                    {item?.label === 'Self Rep. Symptom' && (
                      <span className="relative flex h-2 w-2 mx-2 ">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                      </span>
                    )}
                    {item?.label}
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
            {bioMarkers
              ?.map((marker) => allMetrics[marker])
              .filter((item) => item?.value !== null && item?.value !== undefined)
              .map((item, index) =>
                item?.label !== 'Self Rep. Symptom' ? (
                  <div key={index} className="">
                    <p className="text-xs text-left font-medium mb-1">{item?.label}</p>
                    <p className="text-md text-left font-normal">{item?.value}</p>
                  </div>
                ) : null
              )}
          </div>
          {bioMarkers &&
            bioMarkers
              .map((metric) => allMetrics[metric])
              .filter((item) => item?.value !== null && item?.value !== undefined)
              .filter((item) => item?.label === 'Self Rep. Symptom')
              .map((item, index) => (
                <div key={index} className="w-full mt-8 px-4 py-4 border rounded-sm bg-zinc-50">
                  <p className="text-xs text-left font-medium mb-1">{item?.label}</p>
                  <p className="text-md text-left font-normal">{item?.value}</p>
                </div>
              ))}
        </HoverCardContent>
      </HoverCard>
    )
  }

  return (
    <div>
      {preventionPlan !== null && (
        <div>
          <div className="flex flex-col">
            <div className="flex flex-col gap-4 md:gap-0 md:flex-row justify-between mb-8 md:mb-14">
              <div className="flex flex-col">
                <Badge className="w-fit font-normal bg-white border border-blue-600 text-blue-600 rounded-lg mb-4 hover:bg-white hover:border-blue-600">
                  Active Plan
                </Badge>
                <h1 className="text-lg font-normal text-black">{preventionPlan?.heading}</h1>
                <p className="text-sm font-normal text-slate-500 mt-1">
                  {preventionPlan?.description}
                </p>
                <div className="flex flex-col border rounded-md px-6 py-6 mt-10">
                  <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
                    {preventionPlan?.bioMarkers.map((bioMarker, index) => {
                      const threshold = preventionPlan.PrevetionThresholds[bioMarker]
                      return (
                        <div key={index} className="flex flex-col">
                          <p className="text-md mb-1">
                            {translation(`ActivePreventivePlan.${bioMarker}`)}
                          </p>
                          <p className="text-sm">
                            {bioMarker === 'avgWeight'
                              ? translation('No data')
                              : (bioMarker === 'steps' ||
                                bioMarker === 'avgSaturation' ||
                                bioMarker === 'distance') &&
                                threshold &&
                                'low' in threshold
                                ? `${threshold.low}`
                                : threshold && 'optimal' in threshold
                                  ? `${threshold.optimal[0]} - ${threshold.optimal[1]}`
                                  : translation('No data')}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Calendar
            className="border rounded-md"
            isoWeek
            cellClassName={(date) =>
              PreventionCellClassNames(date, monthData, thresholds!, bioMarkers!)
            }
            renderCell={renderCell}
            onMonthChange={handleMonthChange}
          />
        </div>
      )}
      {preventionPlan === null && (
        <div className="flex flex-col border rounded-lg px-10 py-10 bg-zinc-50">
          <p className="text-lg">{translation('PreventivePlans.no_plan_heading')}</p>
          <p className="text-sm mt-2 text-slate-500">
            {translation('PreventivePlans.no_plan_subheading')}
          </p>
        </div>
      )}
    </div>
  )
}

export default PreventionPlanCalender
