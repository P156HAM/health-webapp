import { Timestamp } from 'firebase/firestore'

export type Report = {
  createdAt: string
  dateOfBirth: string
  id: string
  patientLastName: string
  patientName: string
  patientUID: string
  sharedAt: string
}

export type Reports = Report[]

export interface Patient {
  first_name: string
  last_name: string
  id: string
  date_of_birth: string
}

export interface DailyActiveDurationsSummary {
  end_time: Date
  start_time: Date
  activity_seconds: number
  rest_seconds: number
  low_intensity_seconds: number
  vigorous_intensity_seconds: number
  num_continuous_inactive_periods: number
  inactivity_seconds: number
  moderate_intensity_seconds: number
  standing_seconds: number
  standing_hours_count: number
}

export interface SelfReportedSymptoms {
  DateAndTime: Timestamp | { _seconds: number; _nanoseconds: number }
  UID: string
  created_time: Timestamp | { _seconds: number; _nanoseconds: number }
  text: string
}

export interface DailyDistanceSummary {
  end_time: Date
  start_time: Date
  floors_climbed: number
  steps: number
  distance_meters: number
}
export interface DailyScoreSummary {
  end_time: Date
  start_time: Date
  recovery: number
  activity: number
  sleep: number
}
export interface BodyMeasurementsSamples {
  end_time: Date
  start_time: Date
  weight_kg: number
  BMI: number
  bone_mass_g: number
  muscle_mass_g: number
  bodyfat_percentage: number
  water_percentage: number
  estimated_fitness_age: number
}

export interface BloodPressureSample {
  diastolic_bp: number
  systolic_bp: number
  timestamp: string
}
export interface BodyBloodPressureSamples {
  end_time: Date
  start_time: Date
  blood_pressure_samples: BloodPressureSample[]
}

export interface HRSamples {
  bpm: number
  context: number
  timestamp: Date
}
export interface DailyHeartRateSamples {
  end_time: Date
  start_time: Date
  hr_samples: HRSamples[]
}

export interface DailyHeartRateSummary {
  end_time: Date
  start_time: Date
  max_hr_bpm: number
  resting_hr_bpm: number
  avg_hrv_rmssd: number
  min_hr_bpm: number
  user_max_hr_bpm: number
  avg_hrv_sdnn: number
  avg_hr_bpm: number
}
export interface DailyOxygenSummary {
  end_time: Date
  start_time: Date
  avg_saturation_percentage: number
}

export interface SleepSummary {
  end_time: Date
  start_time: Date
  duration_light_sleep_state_seconds: number
  duration_asleep_state_seconds: number
  num_REM_events: number
  duration_REM_sleep_state_seconds: number
  duration_deep_sleep_state_seconds: number
  duration_in_bed_seconds: number
  duration_unmeasurable_sleep_seconds: number
  sleep_efficiency: number
}
export interface SleepHeartRateSummary {
  end_time: Date
  start_time: Date
  avg_hr_bpm: number
  avg_hrv_rmssd: number
  max_hr_bpm: number
  min_hr_bpm: number
  resting_hr_bpm: number
}
export interface SleepBreathsSummary {
  end_time: Date
  start_time: Date
  avg_breaths_per_min: number
}
export interface DailyStressSummary {
  end_time: Date
  start_time: Date
  high_stress_duration_seconds: number
  rest_stress_duration_seconds: number
  stress_duration_seconds: number
  activity_stress_duration_seconds: number
  avg_stress_level: number
  low_stress_duration_seconds: number
  medium_stress_duration_seconds: number
  max_stress_level: number
}

export interface DataSummary {
  bodyMeasurementsSamples: BodyMeasurementsSamples[][]
  bodyBloodPressureSamples: BodyBloodPressureSamples[][]
  dailyActiveDurationsSummary: DailyActiveDurationsSummary[][]
  dailyDistanceSummary: DailyDistanceSummary[][]
  dailyHeartRateSummary: DailyHeartRateSummary[][]
  dailyHeartRateSamples: DailyHeartRateSamples[][]
  dailyStressSummary: DailyStressSummary[][]
  dailyOxygenSummary: DailyOxygenSummary[][]
  sleepSummary: SleepSummary[][]
  sleepBreathsSummary: SleepBreathsSummary[][]
  sleepHeartRateSummary: SleepHeartRateSummary[][]
  selfReportedSymptoms: SelfReportedSymptoms[][]
  dailyScoresSummary?: DailyScoreSummary[][]
}

export interface Thresholds {
  steps?: { low: number }
  sleepDuration?: { optimal: [number, number] }
  activeMinutes?: { low: number }
  avgHeartRate?: { optimal: [number, number] }
  avgBreaths?: { optimal: [number, number] }
  avgSaturation?: { low: number }
  avgWeight?: { optimal: [number, number] }
  bloodPressureSys?: { optimal: [number, number] }
  bloodPressureDys?: { optimal: [number, number] }
  selfReportedSymptom?: { low: number }
}

export interface PreventionThresholds {
  steps?: { low: number }
  sleepDuration?: { optimal: [number, number] }
  avgHeartRate?: { optimal: [number, number] }
  avgBreaths?: { optimal: [number, number] }
  avgSaturation?: { low: number }
  avgWeight?: { optimal: [number, number] }
  distance?: { low: number }
  hrv?: { optimal: [number, number] }
}

export type MetricKey =
  | 'steps'
  | 'sleepDuration'
  | 'activeMinutes'
  | 'avgHeartRate'
  | 'avgBreaths'
  | 'avgSaturation'
  | 'avgWeight'
  | 'bloodPressureSys'
  | 'bloodPressureDys'
  | 'selfReportedSymptom'

export type PreventionMetricKey =
  | 'steps'
  | 'sleepDuration'
  | 'avgHeartRate'
  | 'avgBreaths'
  | 'avgSaturation'
  | 'avgWeight'
  | 'distance'
  | 'hrv'
