import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import { DailyDistanceSummary } from '../../../../../src/constants/types'
import { useTranslation } from 'react-i18next'

interface DailyActivityprops {
  data: any
}
function DailyActivity({ data }: DailyActivityprops) {
  const [translation] = useTranslation('global')
  const dailyDistanceSummary: DailyDistanceSummary = data.dailyDistanceSummary

  const distance_meters = dailyDistanceSummary && dailyDistanceSummary.distance_meters !== undefined && dailyDistanceSummary.distance_meters !== null
    ? dailyDistanceSummary.distance_meters.toFixed(0) + translation('LongTermReportPage.meters')
    : translation('LongTermReportPage.no_data');

  const steps = dailyDistanceSummary && dailyDistanceSummary.steps !== undefined && dailyDistanceSummary.steps !== null
    ? dailyDistanceSummary.steps.toFixed(0)
    : translation('LongTermReportPage.no_data');

  const floors_climbed = dailyDistanceSummary && dailyDistanceSummary.floors_climbed !== undefined && dailyDistanceSummary.floors_climbed !== null
    ? dailyDistanceSummary.floors_climbed.toFixed(0)
    : translation('LongTermReportPage.no_data');

  const formattedData = {
    [translation('ActivityBiomarker.distance')]: distance_meters,
    [translation('ActivityBiomarker.steps')]: steps,
    [translation('ActivityBiomarker.floors_climbed')]: floors_climbed,
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('ActivityBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">{translation('ActivityBiomarker.subheading')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
        {Object.entries(formattedData).map(([key, value]) => (
          <SectionWithHoverCard key={key} title={key} data={value} />
        ))}
      </div>
    </div>
  )
}

export default DailyActivity
