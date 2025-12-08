import { useState, useEffect } from 'react'
import { auth } from '../firebase/firebase'
import { isMockMode } from '../mocks/config'
import { getMockSamples } from '../mocks/services'

const BASE_URL = process.env.REACT_APP_LONG_TERM_REPORT_URL
const useGetSamples = (id?: string, date?: string) => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async (id: string, date: string) => {
      try {
        if (isMockMode) {
          const mock = await getMockSamples()
          setData(mock)
          return
        }
        const idToken = await auth.currentUser?.getIdToken(true)
        const response = await fetch(`${BASE_URL}/samples/${id}/${date}/`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }
        const result = await response.json()

        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id && date) {
      fetchData(id, date)
    } else {
      setLoading(false)
    }
  }, [id, date])

  return { data, loading, error }
}

export default useGetSamples
