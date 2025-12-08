import { useState, useEffect } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase/firebase'
import { useTranslation } from 'react-i18next'
import { isMockMode } from '../mocks/config'
import { getMockMessages } from '../mocks/services'

interface Message {
  clinicName: string
  healthcareProfessionalName: string
  healthcareProfessionalUID: string
  message: string
  timestamp: any
}

interface GetMessagesResponse {
  success: boolean
  messages: Message[]
}

const useMessageHistory = (patientUID: string, healthcareProfessionalUID: string) => {
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [translation] = useTranslation('global')

  useEffect(() => {
    const fetchMessageHistory = async () => {
      setLoading(true)
      setError(null)

      try {
        if (isMockMode) {
          const mock = await getMockMessages()
          setMessageHistory(mock as any)
          return
        }
        const getMessages = httpsCallable<
          { patientUID: string; healthcareProfessionalUID: string },
          GetMessagesResponse
        >(functions, 'getMessages')

        const response = await getMessages({ patientUID, healthcareProfessionalUID })

        // Access response data safely
        if (response.data && response.data.success) {
          setMessageHistory(response.data.messages)
        } else {
          setError(translation('MessageHistory.fetch_failed'))
        }
      } catch (err) {
        console.error('Error fetching message history:', err)
        setError(translation('MessageHistory.fetch_history_failed'))
      } finally {
        setLoading(false)
      }
    }

    fetchMessageHistory()
  }, [patientUID, healthcareProfessionalUID])

  return { messageHistory, loading, error }
}

export default useMessageHistory
