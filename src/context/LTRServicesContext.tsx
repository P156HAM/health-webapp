import React, { createContext, useState, useContext, useCallback } from 'react'
import { auth, db } from '../firebase/firebase'
import { collection, doc, getDoc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { isMockMode } from '../mocks/config'
import { getMockPatientSummary, getMockPreventionPlans } from '../mocks/services'

interface LTRServicesContextProps {
  data: any
  loading: boolean
  error: string | null
  fetchPatientData: (id: string) => Promise<void>
  selectedPreventionPlan: any
  setSelectedPreventionPlan: (plan: any) => void
  fetchPreventionPlans: (id: string) => Promise<void>
}

interface LTRServicesProviderProps {
  children: React.ReactNode
}

const LTRServicesContext = createContext<LTRServicesContextProps | undefined>(undefined)
const BASE_URL = process.env.REACT_APP_LONG_TERM_REPORT_URL
const LTRServicesProvider = ({ children }: LTRServicesProviderProps) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPreventionPlan, setSelectedPreventionPlan] = useState<any>(null)

  const fetchPatientData = useCallback(async (id: string): Promise<void> => {
    setLoading(true)
    try {
      if (isMockMode) {
        const result = await getMockPatientSummary(id)
        setData(result)
        setError(null)
        return
      }
      const idToken = await auth.currentUser?.getIdToken(true)
      const response = await fetch(`${BASE_URL}/patientsummary/${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      const result = await response.json()

      setData({
        ...result,
        patient: {
          ...result.patient,
          id: id,
        },
        patientId: id,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPreventionPlans = useCallback(async (id: string): Promise<void> => {
    if (isMockMode) {
      const plans = await getMockPreventionPlans(id)
      setSelectedPreventionPlan(plans[0] ?? null)
      return
    }
    const docRef = collection(db, 'patients', id, 'preventivePlans')
    const querySnapshot = await getDocs(query(docRef, orderBy('createdAt', 'desc'), limit(1)))
    if (!querySnapshot.empty) {
      const latestPlan = querySnapshot.docs[0].data().preventionPlan
      setSelectedPreventionPlan(latestPlan)
    } else {
      setSelectedPreventionPlan(null)
    }
  }, [])

  return (
    <LTRServicesContext.Provider
      value={{
        data,
        loading,
        error,
        fetchPatientData,
        selectedPreventionPlan,
        setSelectedPreventionPlan,
        fetchPreventionPlans,
      }}
    >
      {children}
    </LTRServicesContext.Provider>
  )
}

const useLTRServices = () => {
  const context = useContext(LTRServicesContext)
  if (context === undefined) {
    throw new Error('useLTRServices must be used within a LTRServicesProvider')
  }
  return context
}

export { LTRServicesProvider, useLTRServices }
