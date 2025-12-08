import React, { useEffect } from 'react'
import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import HeartRateGraph from './HeartRateGraph'
import { useTranslation } from 'react-i18next'

interface DailyHeartRateProps {
  data: any
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}min`
}

function DailyHeartRate({ data }: DailyHeartRateProps) {
  const [translation] = useTranslation('global')

  const dailyHeartRateSummary = data.dailyHeartRateSummary
  const dailyHeartRateSamples = data.dailyHeartRateSamples
  const avg_hr_bpm =
    dailyHeartRateSummary?.avg_hr_bpm && Number(dailyHeartRateSummary.avg_hr_bpm) > 0
      ? Number(dailyHeartRateSummary.avg_hr_bpm).toFixed(0) + translation('LongTermReportPage.bpm')
      : 'No Data'

  const min_hr_bpm =
    dailyHeartRateSummary?.min_hr_bpm && Number(dailyHeartRateSummary.min_hr_bpm) > 0
      ? Number(dailyHeartRateSummary.min_hr_bpm).toFixed(0) + translation('LongTermReportPage.bpm')
      : 'No Data'

  const max_hr_bpm =
    dailyHeartRateSummary?.max_hr_bpm && Number(dailyHeartRateSummary.max_hr_bpm) > 0
      ? Number(dailyHeartRateSummary.max_hr_bpm).toFixed(0) + translation('LongTermReportPage.bpm')
      : 'No Data'

  const bpm = dailyHeartRateSamples?.hr_samples ? dailyHeartRateSamples?.hr_samples : 'No Data'

  const startTime = dailyHeartRateSummary?.start_time
    ? new Date(dailyHeartRateSummary.start_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    : + translation('LongTermReportPage.no_data')

  const endTime = dailyHeartRateSummary?.end_time
    ? new Date(dailyHeartRateSummary.end_time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
    : + translation('LongTermReportPage.no_data')

  const formattedData = {
    [translation('HeartRateBiomarker.avg_heart_rate')]: avg_hr_bpm,
    [translation('HeartRateBiomarker.min_heart_rate')]: min_hr_bpm,
    [translation('HeartRateBiomarker.max_heart_rate')]: max_hr_bpm,
  }

  useEffect(() => {
  }, [data])

  // Get the selected date, this should be passed as a prop or derived from the data
  const selectedDate = new Date(dailyHeartRateSummary?.start_time)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">
          {translation('HeartRateBiomarker.heading')}
        </h1>
        <p className="text-md text-slate-500">{translation('HeartRateBiomarker.subheading')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4 lg:mb-4">
        {Object.entries(formattedData).map(([key, value]) => (
          <SectionWithHoverCard key={key} title={key} data={value} />
        ))}
      </div>
      <HeartRateGraph bpm={bpm} selectedDate={selectedDate} />
    </div>
  )
}

export default DailyHeartRate
