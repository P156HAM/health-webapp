import { mockDelay, isMockMode } from './config'
import {
  mockAuthUser,
  mockHealthcareProfessional,
  mockHealthReports,
  mockPatient,
  mockDataSummary,
  mockDailySamples,
  mockMessageHistory,
  mockPreventionPlan,
} from './fixtures'
import { Patient, Reports } from '../constants/types'

export const getMockUser = () => mockAuthUser
export const getMockUserData = () => mockHealthcareProfessional

export const getMockHealthReports = async (): Promise<Reports> => {
  await mockDelay()
  return mockHealthReports
}

export const getMockPatient = async (id: string): Promise<Patient | null> => {
  await mockDelay()
  return { ...mockPatient, id }
}

export const getMockPatientSummary = async (id: string) => {
  await mockDelay()
  return {
    ...mockDataSummary,
    patient: { ...mockPatient, id },
    patientId: id,
  }
}

export const getMockPreventionPlans = async (id: string) => {
  await mockDelay()
  return [mockPreventionPlan]
}

export const getMockSamples = async () => {
  await mockDelay()
  return mockDailySamples
}

export const getMockMessages = async () => {
  await mockDelay()
  return mockMessageHistory
}

// Guard to avoid accidental use when not in mock mode
export const ensureMockMode = () => {
  if (!isMockMode) {
    throw new Error('Mock services called while mock mode is disabled')
  }
}
