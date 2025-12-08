import { useState, useEffect } from 'react'
import { doc, getDoc, getFirestore } from 'firebase/firestore'
import { Patient } from '../constants/types'

export const useFetchPatient = (id: string) => {
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || typeof id !== 'string') return

    const fetchPatientByUID = async (id: string) => {
      //console.log('patient id', id)
      const db = getFirestore()
      const patientDocRef = doc(db, 'patients', id)
      try {
        const docSnap = await getDoc(patientDocRef)
        if (docSnap.exists()) {
          const patientData = docSnap.data() as any
          if (patientData && patientData.date_of_birth) {
            patientData.date_of_birth = patientData.date_of_birth
              .toDate()
              .toISOString()
              .split('T')[0]
          }
          setPatient({ ...patientData, id: docSnap.id })
        } else {
          //console.log('No patient found')
          setError('No patient found')
        }
      } catch (error) {
        //console.log('Error fetching patient document', error)
        setError('Error fetching patient document')
      } finally {
        setLoading(false)
      }
    }

    fetchPatientByUID(id)
  }, [id])

  return { patient, loading, error }
}
