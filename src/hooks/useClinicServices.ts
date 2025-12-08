import { useState } from 'react'
import { db } from '../firebase/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '../auth/AuthProvider'

interface UserData {
  clinicID: string
  email: string
}

interface ClinicData {
  stripe_customer_id: string
  stripe_subscription_id: string
  healthcareProfessionals: { [key: string]: string }
}

interface StripeSessionResponse {
  url: string
}

const BASE_URL = process.env.REACT_APP_STRIPE_URL
const useClinicServices = (userData: UserData | null) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const getClinicData = async (clinicID: string): Promise<ClinicData | null> => {
    try {
      const clinicRef = doc(db, 'clinics', clinicID)
      const clinicSnap = await getDoc(clinicRef)

      if (clinicSnap.exists()) {
        return clinicSnap.data() as ClinicData
      } else {
        console.error('No such clinic!')
        return null
      }
    } catch (error) {
      console.error('Error fetching clinic data:', error)
      return null
    }
  }

  const handleStripeSession = async (
    url: string,
    payload: object
  ): Promise<StripeSessionResponse> => {
    try {
      const idToken = user && (await user.getIdToken(true))
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error handling Stripe session:', error)
      throw error
    }
  }

  const goToDashboard = async () => {
    if (!userData) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const clinicData = await getClinicData(userData.clinicID)
      if (!clinicData) {
        return
      }

      const stripeCustomerID = clinicData.stripe_customer_id
      const URL = `${BASE_URL}/dashboard`

      const { url: sessionUrl } = await handleStripeSession(URL, {
        customer: stripeCustomerID,
        return_url: process.env.REACT_APP_RETURN_URL,
      })

      window.location.href = sessionUrl
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const goToPayment = async () => {
    if (!userData) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const clinicData = await getClinicData(userData.clinicID)
      if (!clinicData) {
        return
      }

      const doctors = clinicData.healthcareProfessionals
      let quantity = 0

      for (const doctorId of Object.values(doctors)) {
        const doctorRef = doc(db, 'healthcareProfessionals', doctorId)
        const doctorSnap = await getDoc(doctorRef)
        if (doctorSnap.exists() && doctorSnap.data().isActive === false) {
          quantity += 1
        }
      }

      const URL = `${BASE_URL}/pay`

      const { url: sessionUrl } = await handleStripeSession(URL, {
        quantity,
        client_reference_id: userData.clinicID,
        customer_email: userData.email,
        doctors: JSON.stringify(doctors),
        clinic_ID: userData.clinicID,
      })

      window.location.href = sessionUrl
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const hasInactiveDoctors = async (): Promise<boolean> => {
    if (!userData) {
      return false
    }

    try {
      const clinicData = await getClinicData(userData.clinicID)
      if (!clinicData) {
        return false
      }

      const doctors = clinicData.healthcareProfessionals

      for (const doctorId of Object.values(doctors)) {
        const doctorRef = doc(db, 'healthcareProfessionals', doctorId)
        const doctorSnap = await getDoc(doctorRef)
        if (doctorSnap.exists() && doctorSnap.data().isActive === false) {
          return true
        }
      }

      return false
    } catch (error) {
      console.error('Error checking inactive doctors:', error)
      return false
    }
  }

  const updateStripeSubscription = async () => {
    if (!userData) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const clinicData = await getClinicData(userData.clinicID)
      if (!clinicData || !clinicData.stripe_subscription_id) {
        return
      }

      const doctors = clinicData.healthcareProfessionals
      const quantity = Object.keys(doctors).length
      const stripeSubscriptionID = clinicData.stripe_subscription_id

      const URL = `${BASE_URL}/subscription`

      await handleStripeSession(URL, {
        quantity,
        subscription_id: stripeSubscriptionID,
      })
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const isPaymentReceived = async (): Promise<boolean> => {
    if (!userData) {
      return false
    }

    try {
      const clinicData = await getClinicData(userData.clinicID)
      if (!clinicData) {
        return false
      }

      const { stripe_customer_id, stripe_subscription_id } = clinicData
      return !!(stripe_customer_id && stripe_subscription_id) //true
    } catch (error) {
      console.error('Error checking payment:', error)
      return false
    }
  }

  return {
    getClinicData,
    loading,
    error,
    goToDashboard,
    goToPayment,
    hasInactiveDoctors,
    updateStripeSubscription,
    isPaymentReceived,
  }
}

export default useClinicServices
