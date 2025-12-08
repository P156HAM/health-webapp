import { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Patient } from '../constants/types'

const BASE_URL = process.env.REACT_APP_ACCESS_REQUEST_API_URL
export const useQSharedReport = () => {
  const { id } = useParams<{ id: string }>()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [subcollections, setSubcollections] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dailySamplesData, setDailySamplesData] = useState<any>(null)
  const [samplesLoading, setSamplesLoading] = useState<boolean>(true)
  const [samplesError, setSamplesError] = useState<string | null>(null)
  const location = useLocation()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tokenFromUrl = params.get('src')
    setToken(tokenFromUrl)
  }, [location])

  useEffect(() => {
    const fetchPatient = async () => {
      if (!token) {
        setError('Missing authorization token')
        setLoading(false)
        return
      }

      try {
        console.log('token', token)
        const response = await fetch(`${BASE_URL}/patientsummary/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setPatient(result.patient)
        setSubcollections(result)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching patient data:', error)
        setError('Error fetching patient data.')
        setLoading(false)
      }
    }

    if (token) {
      fetchPatient()
    }
  }, [id, token])

  const fetchSamples = async (patientId: string, date: string) => {
    try {
      console.log('token on samples page: ', token)
      const response = await fetch(`${BASE_URL}/samples/${patientId}/${date}`)
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }
      const result = await response.json()
      setDailySamplesData(result)
      setSamplesLoading(false)
    } catch (err: any) {
      setSamplesError(err.message)
      setSamplesLoading(false)
    }
  }

  const getSamples = (date: string) => {
    if (id) {
      fetchSamples(id, date)
    } else {
      console.log('no id')
    }
  }

  return {
    patient,
    setPatient,
    subcollections,
    setSubcollections,
    loading,
    error,
    dailySamplesData,
    samplesLoading,
    samplesError,
    getSamples,
    setDailySamplesData,
  }
}
