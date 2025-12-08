import { useState } from 'react'
import { getFirestore, doc, onSnapshot } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLogSnag } from '@logsnag/react'

interface AccessRequestResponse {
  accessRequestId: string
}

interface AccessRequestStatusResponse {
  status: string
  uid: string
  patient_uid: string
  patient: string
  expiration: {
    toDate: () => Date
  }
}

const BASE_URL_ACCESS_REQUEST_API = process.env.REACT_APP_ACCESS_REQUEST_API_URL
const BASE_URL_DECRYPT_ACCESS_REQUEST_ID = process.env.REACT_APP_DECRYPT_ACCESS_URL
export const useQRCode = () => {
  const [qrCode, setQrCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const db = getFirestore()
  const navigate = useNavigate()
  const location = useLocation()
  const { track } = useLogSnag()

  const generateQRCode = async (): Promise<string> => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL_ACCESS_REQUEST_API}/generateAccessRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const result = await response.json()
      const data = result.data as { accessRequestId: string }

      return data.accessRequestId
    } catch (error) {
      throw new Error('Error generating access request')
    } finally {
      setLoading(false)
    }
  }

  const getDecryptedAccessRequestId = async (accessRequestId: string): Promise<string> => {
    const url = BASE_URL_DECRYPT_ACCESS_REQUEST_ID as string
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessRequestId: accessRequestId }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const data = await response.json()
      return data.accessRequestId
    } catch (error) {
      console.error('Error decrypting access request id:', error)
      throw new Error('Error decrypting access request id')
    }
  }

  const setupFirestoreListener = (decryptedAccessRequestId: string, accessRequestId: string) => {
    const docRef = doc(db, 'accessRequest', decryptedAccessRequestId)
    onSnapshot(docRef, (doc) => {
      const data = doc.data() as AccessRequestStatusResponse
      if (data && data.status === 'approved' && data.patient) {
        const encodedAccessRequestId = encodeURIComponent(accessRequestId)
        const url = `/quick-shared-report/${decryptedAccessRequestId}/${data.patient}?src=${encodedAccessRequestId}`
        if (location.pathname.includes('dashboard')) {
          const newTabUrl = `${url}&user=true`
          window.open(newTabUrl, '_blank')
          track({
            channel: 'report-clicks',
            event: 'A quick shared report has been approved.',
            icon: '📊',
          })
        } else {
          navigate(url)
          track({
            channel: 'report-clicks',
            event: 'A quick shared report has been approved.',
            icon: '📊',
          })
        }
        handleGenerateQRCode()
      } else {
        //console.log('Document status is not approved or patient information is missing')
      }
    })
  }

  const handleGenerateQRCode = async () => {
    try {
      const accessRequestId = await generateQRCode()
      setQrCode(accessRequestId)
      const decryptedAccessRequestId = await getDecryptedAccessRequestId(accessRequestId)
      setupFirestoreListener(decryptedAccessRequestId, accessRequestId)
    } catch (error) {
      setError('Failed to generate QR code')
    }
  }

  return { qrCode, error, loading, handleGenerateQRCode }
}
