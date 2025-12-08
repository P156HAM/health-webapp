import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { auth, functions } from '../../firebase/firebase'
import { httpsCallable } from 'firebase/functions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog'
import { Patient } from '@/src/constants/types'
import { useToast } from '../ui/use-toast'
import useMessageHistory from '../../hooks/useGetMessageHistory'
import ChatHistory from '../ui/ChatBubble'

interface HealthcareProfessional {
  uid: string
  firstName: string
  lastName: string
}

interface SendMessageDialogProps {
  isOpen: boolean
  onClose: () => void
  healthcareProfessionalsDetails: HealthcareProfessional | null
  onSuccess: () => void
  patient: Patient
}

const SendMessageDialog = ({
  isOpen,
  onClose,
  healthcareProfessionalsDetails,
  onSuccess,
  patient,
}: SendMessageDialogProps) => {
  const [translation] = useTranslation('global')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { toast } = useToast()
  const { messageHistory } = useMessageHistory(
    patient.id,
    healthcareProfessionalsDetails?.uid || ''
  )
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value)
    setError('')
  }

  const handleSendMessage = async () => {
    if (!message.trim() || message.trim().length <= 10) {
      setError(translation('MessageHistory.input_error'))
      return
    }

    try {
      setLoading(true)
      const sendMessage = httpsCallable(functions, 'sendMessage')

      const result: any = await sendMessage({
        message: message,
        patientUID: patient.id,
        healthcareProfessional: healthcareProfessionalsDetails,
      })

      const { messageDocId } = result.data

      const sendNotificationUrl = `${process.env.REACT_APP_SEND_NOTIFICATION_URL}`

      const idToken = await auth.currentUser?.getIdToken(true)
      const requestBody = {
        patientUID: patient.id,
        messageDocId: messageDocId,
        healthcareProfessional_name: `${healthcareProfessionalsDetails?.firstName} ${healthcareProfessionalsDetails?.lastName}`,
      }
      const response = await fetch(sendNotificationUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error sending notification: ${errorText}`)
      }

      toast({
        className: 'bg-green-200 border border-green-500 text-green-900',
        title: translation('MessageHistory.toast_success_heading'),
        description: translation('MessageHistory.toast_success_subheading'),
      })

      onSuccess()
      handleClose()
    } catch (error) {
      //console.error('Error sending message:', error)
      setError(translation('MessageHistory.error_subheading'))
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setMessage('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg sm:max-w-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-xl sm:text-2xl font-medium">
            {translation('MessageHistory.heading')}
          </DialogTitle>
          <DialogDescription className="text-left text-sm sm:text-base">
            {translation('MessageHistory.subheading')} {patient.first_name}.
          </DialogDescription>
        </DialogHeader>

        <ChatHistory
          patientUID={patient.id}
          healthcareProfessionalUID={
            healthcareProfessionalsDetails ? healthcareProfessionalsDetails!.uid : ''
          }
        />

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs sm:text-sm font-medium mb-1">
              {translation('MessageHistory.heading')}
            </p>
            <Input
              placeholder={translation('MessageHistory.placeholder')}
              value={message}
              onChange={handleChange}
              required
              type="text"
              className="w-full"
            />
            {error && (
              <p className="bg-red-100 py-3 px-4 rounded-sm text-red-600 text-sm mt-2">{error}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={handleClose}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {translation('MessageHistory.button_cancel')}
          </Button>
          <Button
            variant="default"
            size="lg"
            onClick={handleSendMessage}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            {loading
              ? translation('MessageHistory.button_sending')
              : translation('MessageHistory.button_send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SendMessageDialog
