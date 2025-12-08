import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import {
  BodyMeasurementsSamples,
  DailyDistanceSummary,
  DailyScoreSummary,
  DailyStressSummary,
  SleepSummary,
} from '../../../../../src/constants/types'
import { useTranslation } from 'react-i18next'

interface DailyScoresprops {
  data: any
}
function DailyScores({ data }: DailyScoresprops) {
  const [translation] = useTranslation('global')
  const sleepSummary: SleepSummary = data.sleepSummary
  const dailyScoreSummary: DailyScoreSummary = data.dailyScoresSummary
  const dailyStressSummary: DailyStressSummary = data.dailyStressSummary

  const avgStressLvl =
    dailyStressSummary &&
      dailyStressSummary.avg_stress_level !== undefined &&
      dailyStressSummary.avg_stress_level !== null
      ? dailyStressSummary.avg_stress_level
      : translation('LongTermReportPage.no_data')
  const sleepEfficiency =
    sleepSummary &&
      sleepSummary.sleep_efficiency !== undefined &&
      sleepSummary.sleep_efficiency !== null
      ? (sleepSummary.sleep_efficiency * 100).toFixed(0)
      : translation('LongTermReportPage.no_data')
  const sleepScore =
    dailyScoreSummary && dailyScoreSummary.sleep !== undefined && dailyScoreSummary.sleep !== null
      ? dailyScoreSummary.sleep
      : translation('LongTermReportPage.no_data')
  const recovery =
    dailyScoreSummary &&
      dailyScoreSummary.recovery !== undefined &&
      dailyScoreSummary.recovery !== null
      ? dailyScoreSummary.recovery
      : translation('LongTermReportPage.no_data')
  const activity =
    dailyScoreSummary &&
      dailyScoreSummary.activity !== undefined &&
      dailyScoreSummary.activity !== null
      ? dailyScoreSummary.activity
      : translation('LongTermReportPage.no_data')

  const formattedData = {
    ['Avg. Stress Level']: avgStressLvl,
    ['Sleep Efficiency']: sleepEfficiency,
    ['Sleep Score']: sleepScore,
    ['Recovery']: recovery,
    ['Activity']: activity,
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('OtherScoresBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">{translation('OtherScoresBiomarker.subheading')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
        {Object.entries(formattedData).map(([key, value]) => (
          <SectionWithHoverCard key={key} title={key} data={value} />
        ))}
      </div>
    </div>
  )
}

export default DailyScores
