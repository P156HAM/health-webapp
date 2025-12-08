import { useState, useEffect } from 'react'
import { collection, getDocs, DocumentData, Timestamp } from 'firebase/firestore'
import { db } from '../firebase/firebase'

interface PreventivePlan {
  id: string
  name: string
  created_by: string
  created_at: string
  plan: any[]
}

const useFetchPreventivePlan = (userUID: string, shouldFetch: boolean) => {
  const [preventivePlan, setPreventivePlan] = useState<PreventivePlan[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!shouldFetch) return

    const fetchPlans = async () => {
      try {
        setLoading(true)
        const q = collection(db, `patients/${userUID}/preventivePlans`)
        const querySnapshot = await getDocs(q)
        const plansList: PreventivePlan[] = querySnapshot.docs.map((doc) => ({
          ...(doc.data() as PreventivePlan),
        }))
        setPreventivePlan(plansList)
      } catch (error) {
        setError((error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    if (userUID) {
      fetchPlans()
    }
  }, [userUID, shouldFetch])

  return { preventivePlan, loading, error }
}

export default useFetchPreventivePlan
