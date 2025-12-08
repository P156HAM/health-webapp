import { useEffect, useRef, useState } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '../../firebase/firebase'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface Message {
  clinicName: string
  healthcareProfessional_name: string
  healthcareProfessionalUID: string
  message: string
  timestamp: any
}

interface GetMessagesResponse {
  success: boolean
  messages: Message[]
}

const ChatBubble = ({ message }: { message: Message }) => {
  const convertFirestoreTimestampToDate = (timestamp: {
    _seconds: number
    _nanoseconds: number
  }) => {
    return new Date(timestamp._seconds * 1000)
  }

  return (
    <div className="flex justify-start">
      <div className="rounded-e-lg rounded-es-lg px-6 py-4 bg-blue-100 text-left w-full mr-2">
        <div className='flex flex-row w-full justify-between mb-2'>
          <p className="text-xs text-blue-600 mt-2">
            {message.timestamp && message.timestamp._seconds
              ? `${convertFirestoreTimestampToDate(message.timestamp).toLocaleString().slice(0, 10)} | ${convertFirestoreTimestampToDate(message.timestamp).toLocaleString().slice(11, 17)}`
              : 'Invalid Date'}
          </p>
        </div>
        <p className="text-sm mt-4 mb-2">{message.message}</p>
      </div>
    </div>
  )
}

const ChatHistory = ({ patientUID, healthcareProfessionalUID }: { patientUID: string, healthcareProfessionalUID: string }) => {
  const [messageHistory, setMessageHistory] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const [translation] = useTranslation('global')

  const fetchMessageHistory = async () => {
    setLoading(true)
    setError(null)

    try {
      const getMessages = httpsCallable<
        { patientUID: string; healthcareProfessionalUID: string },
        GetMessagesResponse
      >(functions, 'getMessages')

      const response = await getMessages({ patientUID, healthcareProfessionalUID })

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

  useEffect(() => {
    fetchMessageHistory()
  }, [patientUID, healthcareProfessionalUID])

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messageHistory])

  const sortedMessages = [...messageHistory].sort(
    (a, b) => a.timestamp._seconds - b.timestamp._seconds
  )

  if (loading) {
    return <p className="px-4 py-4 bg-zinc-100 rounded-md text-left text-sm text-gray-500 animate-pulse mb-4">
      {translation('MessageHistory.loading_messages')}
    </p>
  }

  if (error) {
    return <p className="px-4 py-4 bg-red-100 rounded-md text-left text-sm text-red-500">{error}</p>
  }

  return (
    <div className={`${sortedMessages.length > 0 ? 'h-auto max-h-96 px-4 py-4 border rounded-sm' : 'h-16'} overflow-y-auto mb-8 space-y-4`}>
      {sortedMessages.length > 0 ? (
        sortedMessages.map((msg, index) => <ChatBubble key={index} message={msg} />)
      ) : (
        <p className="px-4 py-4 border bg-zinc-100 rounded-md text-left text-sm text-black">
          {translation('MessageHistory.no_messages')}
        </p>
      )}
      <div ref={chatEndRef} />
    </div>
  )
}

export default ChatHistory
