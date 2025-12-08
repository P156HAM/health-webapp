import React, { useEffect } from 'react'
import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import { useTranslation } from 'react-i18next'
import { start } from 'repl'

interface DailySleepProps {
  data: any
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}min`
}

function DailySleep({ data }: DailySleepProps) {
  const [translation] = useTranslation('global')
  const sleepSummary = data.sleepSummary
  const sleepHeartRateSummary = data.sleepHeartRateSummary
  const sleepBreathsSummary = data.sleepBreathsSummary
  const dailyOxygenSummary = data.dailyOxygenSummary
  const sleepSnoringSummary = data.sleepSnoringSummary

  const sleepDuration = sleepSummary?.duration_asleep_state_seconds
    ? formatDuration(sleepSummary.duration_asleep_state_seconds)
    : translation('LongTermReportPage.no_data');
  const lightSleepDuration = sleepSummary?.duration_light_sleep_state_seconds
    ? formatDuration(sleepSummary.duration_light_sleep_state_seconds)
    : translation('LongTermReportPage.no_data');
  const deepSleepDuration = sleepSummary?.duration_deep_sleep_state_seconds
    ? formatDuration(sleepSummary.duration_deep_sleep_state_seconds)
    : translation('LongTermReportPage.no_data');
  const restingHeartRate = sleepHeartRateSummary?.resting_hr_bpm
    ? `${sleepHeartRateSummary.resting_hr_bpm}` + translation('LongTermReportPage.bpm')
    : translation('LongTermReportPage.no_data');
  const averageHRV = sleepHeartRateSummary?.avg_hrv_rmssd
    ? `${sleepHeartRateSummary.avg_hrv_rmssd}` + translation('LongTermReportPage.miliseconds')
    : translation('LongTermReportPage.no_data');
  const respiration = sleepBreathsSummary?.avg_breaths_per_min
    ? `${Number(sleepBreathsSummary.avg_breaths_per_min).toFixed(0)}`
    : translation('LongTermReportPage.no_data');
  const saturation = dailyOxygenSummary?.avg_saturation_percentage
    ? `${Number(dailyOxygenSummary.avg_saturation_percentage).toFixed(0)}%`
    : translation('LongTermReportPage.no_data');
  const snoringEvents = sleepSnoringSummary?.num_snoring_events
    ? `${sleepSnoringSummary.num_snoring_events}`
    : translation('LongTermReportPage.no_data');
  const startTime = sleepSummary?.start_time
    ? new Date(sleepSummary.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    : translation('LongTermReportPage.no_data');
  const endTime = sleepSummary?.end_time
    ? new Date(sleepSummary.end_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    : translation('LongTermReportPage.no_data');

  const formattedData = {
    'Sleep Duration': sleepDuration,
    'Light Sleep Duration': lightSleepDuration,
    'Deep Sleep Duration': deepSleepDuration,
    Saturation: saturation,
    'Resting Heart Rate': restingHeartRate,
    'Average HRV': averageHRV,
    Respiration: respiration,
    'Snoring Events': snoringEvents,
  }

  useEffect(() => {
  }, [data])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('SleepBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">
          {translation('SleepBiomarker.subheading')} {startTime} {translation('SleepBiomarker.subheading2')} {endTime}.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
        {Object.entries(formattedData).map(([key, value]) => (
          <SectionWithHoverCard key={key} title={key} data={value} />
        ))}
      </div>
    </div>
  )
}

export default DailySleep
