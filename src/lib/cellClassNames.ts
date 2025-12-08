import { Timestamp } from 'firebase/firestore'
import { DataSummary, Thresholds } from '../constants/types'

export const getFormattedDate = (date: Date): string => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return localDate.toISOString().split('T')[0]
}

export const flattenArray = <T>(arrays: T[][] | undefined): T[] => {
  if (!arrays) {
    return []
  }
  return arrays.reduce((acc, val) => acc.concat(val), [])
}

export const cellClassName = (
  date: Date,
  data: DataSummary | null,
  thresholds: Thresholds,
  selectedMetrics: string[]
): string | undefined => {
  if (data === null) {
    return 'bg-gray-100'
  }

  const formattedDate = getFormattedDate(date)

  const flatActiveDurationsData = flattenArray(data.dailyActiveDurationsSummary)
  const flatDistanceData = flattenArray(data.dailyDistanceSummary)
  const flatHeartRateData = flattenArray(data.dailyHeartRateSummary)
  const flatSleepData = flattenArray(data.sleepSummary)
  const flatWeightData = flattenArray(data.bodyMeasurementsSamples)
  const flatBreathsData = flattenArray(data.sleepBreathsSummary)
  const flatSaturationData = flattenArray(data.dailyOxygenSummary)
  const flatBloodPressureData = flattenArray(data.bodyBloodPressureSamples)
  //const flatSelfReportedSymptoms = flattenArray(data.selfReportedSymptoms)

  const activeDurationsData = flatActiveDurationsData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  const distanceData = flatDistanceData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  const heartRateData = flatHeartRateData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  const sleepDataForDate = flatSleepData.filter(
    (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
  )
  const aggregatedSleepDuration = sleepDataForDate.reduce((total, current) => {
    return total + (current.duration_asleep_state_seconds || 0)
  }, 0)

  const weightData = flatWeightData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  const breathsData = flatBreathsData.find(
    (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
  )
  const saturationData = flatSaturationData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  const bloodPressureData = flatBloodPressureData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )
  // const selfReportedSymptoms = flatSelfReportedSymptoms.find((d) => {
  //   const date =
  //     d.DateAndTime instanceof Timestamp
  //       ? d.DateAndTime.toDate()
  //       : new Date(d.DateAndTime._seconds * 1000)
  //   return getFormattedDate(date) === formattedDate
  // })

  const steps = distanceData?.steps ?? null
  const sleepDuration = aggregatedSleepDuration ? aggregatedSleepDuration / 3600 : null
  const activeMinutes = activeDurationsData?.activity_seconds
    ? activeDurationsData?.activity_seconds / 60
    : null
  const avgHeartRate = heartRateData?.avg_hr_bpm ?? null
  const avgWeight = weightData?.weight_kg ?? null
  const avgBreathsPerMin = breathsData?.avg_breaths_per_min ?? null
  const avgSaturationPercentage = saturationData?.avg_saturation_percentage ?? null
  const systolicBPs =
    bloodPressureData?.blood_pressure_samples.map((sample) => sample.systolic_bp) || []
  const diastolicBPs =
    bloodPressureData?.blood_pressure_samples.map((sample) => sample.diastolic_bp) || []
  //const selfRreportedSymptom = selfReportedSymptoms?.text ?? null

  if (
    !activeDurationsData &&
    !distanceData &&
    !heartRateData &&
    sleepDataForDate.length === 0 &&
    !weightData &&
    !breathsData &&
    !saturationData &&
    systolicBPs.length === 0 &&
    diastolicBPs.length === 0
    //!selfRreportedSymptom
  ) {
    return 'bg-gray-100' // Here we set the background colour of the cells with no data here
  }

  if (selectedMetrics.length === 0) {
    return 'bg-gray-100' // Here we set the background color if no checkboxes are selected
  }

  const conditions: Record<string, boolean> = {
    steps: thresholds.steps && steps !== null ? steps >= thresholds.steps.low : true,
    // selfReportedSymptoms:
    //   thresholds.selfReportedSymptom && selfRreportedSymptom !== null ? false : true,
    sleepDuration:
      thresholds.sleepDuration && sleepDuration !== null
        ? sleepDuration >= thresholds.sleepDuration.optimal[0] &&
          sleepDuration <= thresholds.sleepDuration.optimal[1]
        : true,
    activeMinutes:
      thresholds.activeMinutes && activeMinutes !== null
        ? activeMinutes >= thresholds.activeMinutes.low
        : true,
    avgHeartRate:
      thresholds.avgHeartRate && avgHeartRate !== null
        ? avgHeartRate >= thresholds.avgHeartRate.optimal[0] &&
          avgHeartRate <= thresholds.avgHeartRate.optimal[1]
        : true,
    avgWeight:
      thresholds.avgWeight && avgWeight !== null
        ? avgWeight >= thresholds.avgWeight.optimal[0]
        : true,
    avgBreaths:
      thresholds.avgBreaths && avgBreathsPerMin !== null
        ? avgBreathsPerMin >= thresholds.avgBreaths.optimal[0] &&
          avgBreathsPerMin <= thresholds.avgBreaths.optimal[1]
        : true,
    avgSaturation:
      thresholds.avgSaturation && avgSaturationPercentage !== null
        ? Math.round(avgSaturationPercentage) >= thresholds.avgSaturation.low
        : true,
    bloodPressureSys:
      thresholds.bloodPressureSys && systolicBPs.length > 0
        ? systolicBPs.every(
            (bp) =>
              bp >= (thresholds.bloodPressureSys?.optimal[0] ?? -Infinity) &&
              bp <= (thresholds.bloodPressureSys?.optimal[1] ?? Infinity)
          )
        : true,
    bloodPressureDys:
      thresholds.bloodPressureDys && diastolicBPs.length > 0
        ? diastolicBPs.every(
            (bp) =>
              bp >= (thresholds.bloodPressureDys?.optimal[0] ?? -Infinity) &&
              bp <= (thresholds.bloodPressureDys?.optimal[1] ?? Infinity)
          )
        : true,
  }

  const selectedConditions = selectedMetrics
    .filter((metric) => metric !== 'selfReportedSymptom')
    .map((metric) => conditions[metric])

  const allSelectedMetricsHaveData = selectedMetrics
    .map((metric) => {
      if (metric === 'steps') return steps !== null
      if (metric === 'sleepDuration') return sleepDuration !== null
      if (metric === 'activeMinutes') return activeMinutes !== null
      if (metric === 'avgHeartRate') return avgHeartRate !== null
      if (metric === 'avgWeight') return avgWeight !== null
      if (metric === 'avgBreaths') return avgBreathsPerMin !== null
      if (metric === 'avgSaturation') return avgSaturationPercentage !== null
      if (metric === 'bloodPressureSys') return systolicBPs.length > 0
      if (metric === 'bloodPressureDys') return diastolicBPs.length > 0
      //if (metric === 'selfReportedSymptom') return selfReportedSymptoms !== null
      return false
    })
    .some((hasData) => hasData)

  if (!allSelectedMetricsHaveData) {
    return 'bg-gray-100'
  }

  if (selectedConditions.length === 0) {
    return 'bg-gray-100'
  }

  const allConditionsMet = selectedConditions.every((condition) => condition)

  return allConditionsMet
    ? 'bg-green-200 hover:bg-green-300 hover:text-green-900'
    : 'bg-red-200 hover:bg-red-300 hover:text-red-900'
}
