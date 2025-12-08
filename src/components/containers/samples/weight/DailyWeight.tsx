import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import { BodyMeasurementsSamples } from '../../../../../src/constants/types'
import { useTranslation } from 'react-i18next'

interface DailyWeightprops {
  data: any
}
function DailyWeight({ data }: DailyWeightprops) {
  const [translation] = useTranslation('global')
  const dailyWeightSummary: BodyMeasurementsSamples = data.bodyMeasurementsSamples

  const Weight =
    dailyWeightSummary &&
      dailyWeightSummary.weight_kg !== undefined &&
      dailyWeightSummary.weight_kg !== null
      ? dailyWeightSummary.weight_kg.toFixed(1) + ' kg'
      : translation('LongTermReportPage.no_data')
  const BMI =
    dailyWeightSummary && dailyWeightSummary.BMI !== undefined && dailyWeightSummary.BMI !== null
      ? dailyWeightSummary.BMI
      : translation('LongTermReportPage.no_data')
  const muscle_mass_kg =
    dailyWeightSummary &&
      dailyWeightSummary.muscle_mass_g !== undefined &&
      dailyWeightSummary.muscle_mass_g !== null
      ? (dailyWeightSummary.muscle_mass_g / 1000).toFixed(1) + ' kg'
      : translation('LongTermReportPage.no_data')
  const bone_mass_kg =
    dailyWeightSummary &&
      dailyWeightSummary.bone_mass_g !== undefined &&
      dailyWeightSummary.bone_mass_g !== null
      ? (dailyWeightSummary.bone_mass_g / 1000).toFixed(1) + ' kg'
      : translation('LongTermReportPage.no_data')
  const bodyfat_percentage =
    dailyWeightSummary &&
      dailyWeightSummary.bodyfat_percentage !== undefined &&
      dailyWeightSummary.bodyfat_percentage !== null
      ? dailyWeightSummary.bodyfat_percentage.toFixed(1) + '%'
      : translation('LongTermReportPage.no_data')
  const water_percentage =
    dailyWeightSummary &&
      dailyWeightSummary.water_percentage !== undefined &&
      dailyWeightSummary.water_percentage !== null
      ? dailyWeightSummary.water_percentage.toFixed(1) + '%'
      : translation('LongTermReportPage.no_data')
  const estimated_fitness_age =
    dailyWeightSummary &&
      dailyWeightSummary.estimated_fitness_age !== undefined &&
      dailyWeightSummary.estimated_fitness_age !== null
      ? dailyWeightSummary.estimated_fitness_age + ' years'
      : translation('LongTermReportPage.no_data')

  const formattedData = {
    ['Weight']: Weight,
    ['BMI']: BMI,
    ['Muscle mass']: muscle_mass_kg,
    ['Bone Mass']: bone_mass_kg,
    ['Body Fat Percentage']: bodyfat_percentage,
    ['Water Percentage']: water_percentage,
    ['Estimated Fitness age']: estimated_fitness_age,
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('WeightBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">{translation('WeightBiomarker.subheading')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
        {Object.entries(formattedData).map(([key, value]) => (
          <SectionWithHoverCard key={key} title={key} data={value} />
        ))}
      </div>
    </div>
  )
}

export default DailyWeight
