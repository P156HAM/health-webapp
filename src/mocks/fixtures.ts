import { User } from 'firebase/auth';
import { Reports, Patient, DataSummary } from '../constants/types';

const today = new Date();
today.setHours(8, 0, 0, 0);
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);

const setTime = (base: Date, hours: number, minutes: number, seconds = 0) => {
  const d = new Date(base);
  d.setHours(hours, minutes, seconds, 0);
  return d;
};

// Basic mock user and profile used when mock mode is enabled
export const mockAuthUser = {
  uid: 'mock-user-1',
  email: 'demo.clinician@vizu.health',
} as unknown as User;

export const mockHealthcareProfessional = {
  uid: 'mock-user-1',
  firstName: 'Dana',
  lastName: 'Care',
  clinicName: 'Demo Clinic',
  clinicAddress: '123 Demo St',
  clinicCity: 'Demo City',
  clinicCountry: 'Wonderland',
  clinicID: 'CLINIC-001',
  email: 'demo.clinician@vizu.health',
  approvedTerms: true,
  approvedPrivacy: true,
  isAdmin: true,
  isOnboarded: true,
  isHealthcareProfessional: true,
  isActive: true,
};

export const mockHealthReports: Reports = [
  {
    id: 'patient-001',
    patientUID: 'patient-001',
    patientName: 'Alice',
    patientLastName: 'Anders',
    dateOfBirth: '1990-04-12',
    createdAt: today.toISOString().split('T')[0],
    sharedAt: yesterday.toISOString().split('T')[0],
  },
  {
    id: 'patient-002',
    patientUID: 'patient-002',
    patientName: 'Bruno',
    patientLastName: 'Berg',
    dateOfBirth: '1987-02-20',
    createdAt: today.toISOString().split('T')[0],
    sharedAt: yesterday.toISOString().split('T')[0],
  },
];

export const mockPatient: Patient = {
  id: 'patient-001',
  first_name: 'Alice',
  last_name: 'Anders',
  date_of_birth: '1990-04-12',
};

export const mockDataSummary: DataSummary = {
  dailyActiveDurationsSummary: [[
    {
      start_time: yesterday,
      end_time: today,
      activity_seconds: 4200,
      rest_seconds: 18000,
      low_intensity_seconds: 3600,
      vigorous_intensity_seconds: 600,
      num_continuous_inactive_periods: 3,
      inactivity_seconds: 5400,
      moderate_intensity_seconds: 1200,
      standing_seconds: 7200,
      standing_hours_count: 5,
    },
  ]],
  dailyDistanceSummary: [[
    {
      start_time: yesterday,
      end_time: today,
      floors_climbed: 10,
      steps: 10500,
      distance_meters: 7400,
    },
  ]],
  dailyHeartRateSummary: [[
    {
      start_time: yesterday,
      end_time: today,
      max_hr_bpm: 150,
      resting_hr_bpm: 60,
      avg_hrv_rmssd: 42,
      min_hr_bpm: 55,
      user_max_hr_bpm: 185,
      avg_hrv_sdnn: 38,
      avg_hr_bpm: 78,
    },
  ]],
  dailyHeartRateSamples: [[
    {
      start_time: yesterday,
      end_time: today,
      hr_samples: [
        { bpm: 72, context: 1, timestamp: setTime(today, 7, 0) },
        { bpm: 96, context: 2, timestamp: setTime(today, 12, 0) },
        { bpm: 68, context: 3, timestamp: setTime(today, 22, 0) },
      ],
    },
  ]],
  sleepSummary: [[
    {
      start_time: setTime(yesterday, 22, 30),
      end_time: setTime(today, 6, 30),
      duration_light_sleep_state_seconds: 10800,
      duration_asleep_state_seconds: 27000,
      num_REM_events: 4,
      duration_REM_sleep_state_seconds: 7200,
      duration_deep_sleep_state_seconds: 5400,
      duration_in_bed_seconds: 28800,
      duration_unmeasurable_sleep_seconds: 0,
      sleep_efficiency: 0.92,
    },
  ]],
  bodyMeasurementsSamples: [[
    {
      start_time: yesterday,
      end_time: today,
      weight_kg: 68.2,
      BMI: 22.1,
      bone_mass_g: 2500,
      muscle_mass_g: 32000,
      bodyfat_percentage: 21.4,
      water_percentage: 55.2,
      estimated_fitness_age: 29,
    },
  ]],
  sleepBreathsSummary: [[
    {
      start_time: setTime(yesterday, 22, 30),
      end_time: setTime(today, 6, 30),
      avg_breaths_per_min: 14.2,
    },
  ]],
  sleepHeartRateSummary: [[
    {
      start_time: setTime(yesterday, 22, 30),
      end_time: setTime(today, 6, 30),
      avg_hrv_rmssd: 40,
      avg_hr_bpm: 62,
      max_hr_bpm: 90,
      min_hr_bpm: 55,
      resting_hr_bpm: 60,
    },
  ]],
  dailyOxygenSummary: [[
    {
      start_time: new Date('2024-05-11T22:30:00Z'),
      end_time: new Date('2024-05-12T06:30:00Z'),
      avg_saturation_percentage: 98,
    },
  ]],
  bodyBloodPressureSamples: [[
    {
      start_time: today,
      end_time: today,
      blood_pressure_samples: [
        {
          diastolic_bp: 78,
          systolic_bp: 122,
          timestamp: setTime(today, 8, 30).toISOString(),
        },
      ],
    },
  ]],
  selfReportedSymptoms: [[
    {
      UID: 'patient-001',
      DateAndTime: { _seconds: Math.floor(setTime(today, 9, 0).getTime() / 1000), _nanoseconds: 0 },
      created_time: { _seconds: Math.floor(setTime(today, 9, 0).getTime() / 1000), _nanoseconds: 0 },
      text: 'Felt a bit tired after lunch',
    },
  ]],
  dailyStressSummary: [[
    {
      start_time: yesterday,
      end_time: today,
      high_stress_duration_seconds: 900,
      rest_stress_duration_seconds: 5400,
      stress_duration_seconds: 1800,
      activity_stress_duration_seconds: 600,
      avg_stress_level: 35,
      low_stress_duration_seconds: 7200,
      medium_stress_duration_seconds: 3600,
      max_stress_level: 78,
    },
  ]] as any, // type expects but not declared above, keep for downstream consumers
  dailyScoresSummary: [[
    {
      start_time: yesterday,
      end_time: today,
      recovery: 78,
      activity: 82,
      sleep: 75,
    },
  ]] as any,
};

export const mockDailySamples = {
  patient: mockPatient,
  dailyHeartRateSummary: {
    start_time: yesterday,
    end_time: today,
    avg_hr_bpm: 78,
    min_hr_bpm: 55,
    max_hr_bpm: 150,
    resting_hr_bpm: 60,
    avg_hrv_rmssd: 42,
  },
  dailyHeartRateSamples: {
    start_time: yesterday,
    end_time: today,
    hr_samples: [
      { bpm: 72, context: 1, timestamp: setTime(today, 7, 0).toISOString() },
      { bpm: 96, context: 2, timestamp: setTime(today, 12, 0).toISOString() },
      { bpm: 68, context: 3, timestamp: setTime(today, 22, 0).toISOString() },
    ],
  },
  sleepSummary: {
    start_time: setTime(yesterday, 22, 30),
    end_time: setTime(today, 6, 30),
    duration_light_sleep_state_seconds: 10800,
    duration_asleep_state_seconds: 27000,
    num_REM_events: 4,
    duration_REM_sleep_state_seconds: 7200,
    duration_deep_sleep_state_seconds: 5400,
    duration_in_bed_seconds: 28800,
    duration_unmeasurable_sleep_seconds: 0,
    sleep_efficiency: 0.92,
  },
  sleepHeartRateSummary: {
    start_time: setTime(yesterday, 22, 30),
    end_time: setTime(today, 6, 30),
    avg_hrv_rmssd: 40,
    avg_hrv_sdnn: 36,
    avg_hr_bpm: 62,
    max_hr_bpm: 90,
    min_hr_bpm: 55,
    resting_hr_bpm: 60,
  },
  sleepBreathsSummary: {
    start_time: new Date('2024-05-11T22:30:00Z'),
    end_time: new Date('2024-05-12T06:30:00Z'),
    avg_breaths_per_min: 14.2,
  },
  dailyOxygenSummary: {
    start_time: new Date('2024-05-11T22:30:00Z'),
    end_time: new Date('2024-05-12T06:30:00Z'),
    avg_saturation_percentage: 98,
  },
  dailyDistanceSummary: {
    start_time: yesterday,
    end_time: today,
    floors_climbed: 10,
    steps: 10500,
    distance_meters: 7400,
  },
  bodyMeasurementsSamples: {
    start_time: yesterday,
    end_time: today,
    weight_kg: 68.2,
    BMI: 22.1,
    bone_mass_g: 2500,
    muscle_mass_g: 32000,
    bodyfat_percentage: 21.4,
    water_percentage: 55.2,
    estimated_fitness_age: 29,
  },
  bodyBloodPressureSamples: {
    start_time: today,
    end_time: today,
    blood_pressure_samples: [
      {
        diastolic_bp: 78,
        systolic_bp: 122,
        timestamp: setTime(today, 8, 30).toISOString(),
      },
    ],
  },
  selfReportedSymptoms: [
    {
      UID: 'patient-001',
      DateAndTime: { _seconds: Math.floor(setTime(today, 9, 0).getTime() / 1000), _nanoseconds: 0 },
      created_time: { _seconds: Math.floor(setTime(today, 9, 0).getTime() / 1000), _nanoseconds: 0 },
      text: 'Felt a bit tired after lunch',
    },
  ],
  dailyScoresSummary: {
    recovery: 78,
    activity: 82,
    sleep: 75,
    start_time: yesterday,
    end_time: today,
  },
  dailyStressSummary: {
    start_time: yesterday,
    end_time: today,
    high_stress_duration_seconds: 900,
    rest_stress_duration_seconds: 5400,
    stress_duration_seconds: 1800,
    activity_stress_duration_seconds: 600,
    avg_stress_level: 35,
    low_stress_duration_seconds: 7200,
    medium_stress_duration_seconds: 3600,
    max_stress_level: 78,
  },
  sleepSnoringSummary: {
    start_time: new Date('2024-05-11T22:30:00Z'),
    end_time: new Date('2024-05-12T06:30:00Z'),
    num_snoring_events: 3,
  },
};

export const mockMessageHistory = [
  {
    clinicName: 'Demo Clinic',
    healthcareProfessionalName: 'Dana Care',
    healthcareProfessionalUID: 'mock-user-1',
    message: 'Welcome to your mock inbox!',
    timestamp: new Date().toISOString(),
  },
];

export const mockPreventionPlan = {
  heading: 'General Health',
  description: 'Demo preventive plan tailored for general wellness.',
  bioMarkers: ['sleepDuration', 'steps', 'distance', 'avgHeartRate', 'hrv', 'avgWeight'],
  PrevetionThresholds: {
    sleepDuration: { optimal: [7, 9] },
    steps: { low: 8000 },
    distance: { low: 5000 },
    avgHeartRate: { optimal: [60, 100] },
    hrv: { optimal: [20, 80] },
    avgWeight: { optimal: [0, 2000] },
  },
};


