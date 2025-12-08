import { Timestamp } from 'firebase/firestore'
import { DataSummary, PreventionThresholds } from '../constants/types'
import { flattenArray, getFormattedDate } from './cellClassNames'

export const PreventionCellClassNames = (
  date: Date,
  data: DataSummary | null,
  thresholds: PreventionThresholds | null,
  selectedMetrics: string[] | null
): string | undefined => {
  if (data === null) {
    return 'bg-gray-100'
  }

  const formattedDate = getFormattedDate(date)

  const flatDistanceData = flattenArray(data.dailyDistanceSummary) || []
  const flatHeartRateData = flattenArray(data.dailyHeartRateSummary) || []
  const flatSleepData = flattenArray(data.sleepSummary) || []
  const flatSleepHeartRateData = flattenArray(data.sleepHeartRateSummary) || []
  const flatWeightData = flattenArray(data.bodyMeasurementsSamples) || []
  const flatBreathsData = flattenArray(data.sleepBreathsSummary) || []
  const flatSaturationData = flattenArray(data.dailyOxygenSummary) || []

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
  const sleepHeartRateData = flatSleepHeartRateData.find(
    (d) => getFormattedDate(new Date(d.end_time)) === formattedDate
  )
  const saturationData = flatSaturationData.find(
    (d) => getFormattedDate(new Date(d.start_time)) === formattedDate
  )

  const steps = distanceData?.steps ?? null
  const distance = distanceData?.distance_meters ?? null
  const sleepDuration = aggregatedSleepDuration ? aggregatedSleepDuration / 3600 : null
  const avgHeartRate = heartRateData?.avg_hr_bpm ?? null
  const avg_hrv_rmssd = sleepHeartRateData?.avg_hrv_rmssd ?? null
  const avgWeight = weightData?.weight_kg ?? null
  const avgBreathsPerMin = breathsData?.avg_breaths_per_min ?? null
  const avgSaturationPercentage = saturationData?.avg_saturation_percentage ?? null

  if (
    !distance &&
    !distanceData &&
    !heartRateData &&
    sleepDataForDate.length === 0 &&
    !weightData &&
    !breathsData &&
    !saturationData &&
    !avg_hrv_rmssd
  ) {
    return 'bg-gray-100'
  }

  if (selectedMetrics && selectedMetrics.length === 0) {
    return 'bg-gray-100'
  }

  const conditions: Record<string, boolean> = {
    steps: thresholds && thresholds.steps && steps !== null ? steps >= thresholds.steps.low : true,
    sleepDuration:
      thresholds && thresholds.sleepDuration && sleepDuration !== null
        ? sleepDuration >= thresholds.sleepDuration.optimal[0] &&
          sleepDuration <= thresholds.sleepDuration.optimal[1]
        : true,
    avgHeartRate:
      thresholds && thresholds.avgHeartRate && avgHeartRate !== null
        ? avgHeartRate >= thresholds.avgHeartRate.optimal[0] &&
          avgHeartRate <= thresholds.avgHeartRate.optimal[1]
        : true,
    hrv:
      thresholds && thresholds.hrv && avg_hrv_rmssd !== null
        ? avg_hrv_rmssd >= thresholds.hrv.optimal[0] && avg_hrv_rmssd <= thresholds.hrv.optimal[1]
        : true,
    avgWeight:
      thresholds && thresholds.avgWeight && avgWeight !== null
        ? avgWeight >= thresholds.avgWeight.optimal[0]
        : true,
    avgBreaths:
      thresholds && thresholds.avgBreaths && avgBreathsPerMin !== null
        ? avgBreathsPerMin >= thresholds.avgBreaths.optimal[0] &&
          avgBreathsPerMin <= thresholds.avgBreaths.optimal[1]
        : true,
    avgSaturation:
      thresholds && thresholds.avgSaturation && avgSaturationPercentage !== null
        ? Math.round(avgSaturationPercentage) >= thresholds.avgSaturation.low
        : true,
    distance:
      thresholds && thresholds.distance && distance !== null
        ? distance >= thresholds.distance.low
        : true,
  }

  const selectedConditions =
    (selectedMetrics &&
      selectedMetrics
        .filter((metric) => metric !== 'selfReportedSymptom')
        .map((metric) => conditions[metric])) ||
    []

  const allSelectedMetricsHaveData =
    selectedMetrics &&
    selectedMetrics
      .map((metric) => {
        if (metric === 'steps') return steps !== null
        if (metric === 'sleepDuration') return sleepDuration !== null
        if (metric === 'distance') return distance !== null
        if (metric === 'avgHeartRate') return avgHeartRate !== null
        if (metric === 'avgWeight') return avgWeight !== null
        if (metric === 'avgBreaths') return avgBreathsPerMin !== null
        if (metric === 'avgSaturation') return avgSaturationPercentage !== null
        if (metric === 'hrv') return avg_hrv_rmssd !== null
        return false
      })
      .some((hasData) => hasData)

  if (!allSelectedMetricsHaveData) {
    return 'bg-gray-100'
  }

  if (selectedConditions && selectedConditions.length === 0) {
    return 'bg-gray-100'
  }

  const allConditionsMet = selectedConditions && selectedConditions.every((condition) => condition)

  return allConditionsMet
    ? 'bg-green-200 hover:bg-green-300 hover:text-green-900'
    : 'bg-red-200 hover:bg-red-300 hover:text-red-900'
}
