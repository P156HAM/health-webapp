import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from 'src/components/ui/button'
import { db, functions } from '../../firebase/firebase'
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
import { ArrowDownIcon } from '@radix-ui/react-icons'
import { deleteDoc, doc, getDoc } from 'firebase/firestore'
import { Badge } from '../ui/badge'

interface HealthcareProfessional {
  uid: string
  firstName: string
  lastName: string
  email: string
}

interface TimeSelectorProps {
  reminderTime: string
  handleTimeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
}

interface SetReminderDialogProps {
  isOpen: boolean
  onClose: () => void
  healthcareProfessionalsDetails: HealthcareProfessional | null
  onSuccess: () => void
  patient: Patient
}

interface Reminder {
  healthcareProfessional_uid: string
  healthcareProfessionalEmail: string
  patientName: string
  patientUID: string
  reminderFrequency: 'tri-weekly' | 'bi-weekly' | 'weekly' | 'daily'
  reminderTime: any
  startDay: number
}

const SetReminderDialog = ({
  isOpen,
  onClose,
  healthcareProfessionalsDetails,
  onSuccess,
  patient,
}: SetReminderDialogProps) => {
  const { t: translation } = useTranslation('global')
  const [loading, setLoading] = useState(false)
  const [fetchingReminder, setFetchingReminder] = useState(true)
  const [error, setError] = useState('')
  const [reminderFrequency, setReminderFrequency] = useState<
    'tri-weekly' | 'bi-weekly' | 'weekly' | 'daily'
  >('daily')
  const [reminderTime, setReminderTime] = useState('10:00')
  const [reminder, setReminder] = useState<Reminder | null>(null)
  const [startDay, setStartDay] = useState<number>(1)
  const { toast } = useToast()

  const fetchReminder = async () => {
    if (!patient.id || !healthcareProfessionalsDetails?.uid) return

    setFetchingReminder(true)
    try {
      // Add a 1-second delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const reminderDocRef = doc(
        db,
        `patients/${patient.id}/reminders/${healthcareProfessionalsDetails.uid}`
      )
      const reminderSnapshot = await getDoc(reminderDocRef)

      if (reminderSnapshot.exists()) {
        const reminderData = reminderSnapshot.data() as Reminder
        setReminder(reminderData)
      } else {
        console.log('No reminder found.')
        setReminder(null)
      }
    } catch (error) {
      console.error('Error fetching reminder:', error)
      setReminder(null)
    } finally {
      setFetchingReminder(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchReminder()
    }
  }, [isOpen, patient.id, healthcareProfessionalsDetails?.uid])

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReminderFrequency(e.target.value as 'tri-weekly' | 'bi-weekly' | 'weekly' | 'daily')
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReminderTime(e.target.value)
  }

  const handleStartDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStartDay(parseInt(e.target.value, 10))
  }

  const handleSetReminder = async () => {
    if (!reminderTime) {
      setError(translation('SetReminderDialog.input_error'))
      return
    }

    try {
      setLoading(true)
      const setReminder = httpsCallable(functions, 'setReminder')
      const reminder: Reminder = {
        healthcareProfessional_uid: healthcareProfessionalsDetails!.uid,
        healthcareProfessionalEmail: healthcareProfessionalsDetails!.email,
        patientName: `${patient.first_name} ${patient.last_name}`,
        patientUID: patient.id,
        reminderFrequency,
        reminderTime,
        startDay,
      }

      await setReminder(reminder)

      toast({
        className: 'bg-green-200 border border-green-500 text-green-900',
        title: translation('SetReminderDialog.toast_success_heading'),
        description: translation('SetReminderDialog.toast_success_subheading'),
      })

      //onSuccess()
      //handleClose()
      fetchReminder()
    } catch (error) {
      setError(translation('SetReminderDialog.error_subheading'))
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReminder = async () => {
    try {
      const deleteReminder = httpsCallable(functions, 'deleteReminderTask')
      const reminderData = {
        healthcareProfessional_uid: healthcareProfessionalsDetails?.uid,
        patientUID: patient.id,
      }
      await deleteReminder(reminderData)
      setReminder(null)

      toast({
        className: 'bg-green-200 border border-green-500 text-green-900',
        title: translation('SetReminderDialog.toast_success_heading_reminder_deleted'),
        description: translation('SetReminderDialog.toast_success_subheading_reminder_deleted'),
      })
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0') + ':00')
  const days = [
    { value: 1, label: translation('SetReminderDialog.monday') },
    { value: 2, label: translation('SetReminderDialog.tuesday') },
    { value: 3, label: translation('SetReminderDialog.wednesday') },
    { value: 4, label: translation('SetReminderDialog.thursday') },
    { value: 5, label: translation('SetReminderDialog.friday') },
    { value: 6, label: translation('SetReminderDialog.saturday') },
    { value: 0, label: translation('SetReminderDialog.sunday') },
  ]

  const TimeSelector = ({ reminderTime, handleTimeChange }: TimeSelectorProps) => (
    <div className="w-2/4 relative">
      <select
        value={reminderTime}
        onChange={handleTimeChange}
        className="w-full p-4 bg-neutral-100 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-black ">
        <ArrowDownIcon className="h-4 w-4" />
      </div>
    </div>
  )

  const DaySelector = ({
    startDay,
    handleStartDayChange,
  }: {
    startDay: number
    handleStartDayChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  }) => (
    <div className="w-2/4 relative">
      <select
        value={startDay}
        onChange={handleStartDayChange}
        className="w-full p-4 bg-neutral-100 border rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
      >
        {days.map((day) => (
          <option key={day.value} value={day.value}>
            {day.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-black ">
        <ArrowDownIcon className="h-4 w-4" />
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-[90%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-left text-lg sm:text-xl lg:text-2xl font-medium">
            {translation('SetReminderDialog.heading')}
          </DialogTitle>
          <DialogDescription className="text-left text-sm lg:text-base">
            {translation('SetReminderDialog.subheading')} <br /> <br />
            {translation('SetReminderDialog.subheading2')}
          </DialogDescription>
        </DialogHeader>

        {fetchingReminder ? (
          <p className="text-center text-sm text-black bg-zinc-200 p-4 rounded-md animate-pulse">
            {translation('SetReminderDialog.fetching_reminder_text')}{' '}
          </p>
        ) : reminder ? (
          <div className="w-full border border-black/30 p-3 sm:p-4 rounded-md transition-all duration-300 ease-in-out hover:shadow-sm hover:border-black/70">
            <div className='flex flex-col md:flex-row justify-between mditems-end'>
              <div className='flex flex-col gap-2'>
                <Badge variant={'outline'} className='w-fit text-sm font-normal border-black/40'>{reminder.reminderFrequency.charAt(0).toUpperCase() + reminder.reminderFrequency.slice(1)}</Badge>
                <p className='text-md md:text-sm mt-4 mb-4 md:mb-0'>
                  {translation('SetReminderDialog.reminder_occurs_at')} {' '}
                  {new Date(reminder.reminderTime.seconds * 1000).toLocaleDateString()} {'| '}
                  {new Date(reminder.reminderTime.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDeleteReminder}
                size={'sm'}
                className="w-full font-normal md:w-fit"
              >
                {translation('SetReminderDialog.remove_button')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            <div className="w-full rounded-md">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full border p-3 sm:p-4 rounded-md transition-all duration-300 ease-in-out hover:shadow-sm hover:border-black/30">
                  <p className="text-md md:text-lg font-medium">
                    {translation('SetReminderDialog.frequency')}
                  </p>
                  <p className="text-sm text-black/50 mb-6 sm:mb-8">
                    {translation('SetReminderDialog.frequency_subheading')}
                  </p>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="daily"
                        checked={reminderFrequency === 'daily'}
                        onChange={handleFrequencyChange}
                        className="mr-1 sm:mr-2"
                      />
                      {translation('SetReminderDialog.daily')}
                    </label>
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="weekly"
                        checked={reminderFrequency === 'weekly'}
                        onChange={handleFrequencyChange}
                        className="mr-1 sm:mr-2"
                      />
                      {translation('SetReminderDialog.weekly')}
                    </label>
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="bi-weekly"
                        checked={reminderFrequency === 'bi-weekly'}
                        onChange={handleFrequencyChange}
                        className="mr-1 sm:mr-2"
                      />
                      {translation('SetReminderDialog.bi_weekly')}
                    </label>
                    <label className="text-sm">
                      <input
                        type="radio"
                        value="tri-weekly"
                        checked={reminderFrequency === 'tri-weekly'}
                        onChange={handleFrequencyChange}
                        className="mr-1 sm:mr-2"
                      />
                      {translation('SetReminderDialog.monthly')}
                    </label>
                  </div>
                </div>
                <div className="w-full border p-3 sm:p-4 rounded-md transition-all duration-300 ease-in-out hover:shadow-sm hover:border-black/30">
                  <p className="text-md md:text-lg font-medium">
                    {translation('SetReminderDialog.time')}
                  </p>
                  <p className="text-sm text-black/50 mb-4 sm:mb-8">
                    {translation('SetReminderDialog.time_subheading')}
                  </p>
                  <div className="w-full flex flex-row gap-4">
                    {reminderFrequency !== 'daily' && (
                      <DaySelector startDay={startDay} handleStartDayChange={handleStartDayChange} />
                    )}
                    <TimeSelector reminderTime={reminderTime} handleTimeChange={handleTimeChange} />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <p className="bg-red-100 py-2 sm:py-3 px-3 sm:px-4 rounded-sm text-red-600 text-xs sm:text-sm mt-2">
                {error}
              </p>
            )}
          </div>
        )}

        {!fetchingReminder && !reminder && (
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 sm:mt-8">
            <Button variant="outline" onClick={handleClose} size={'lg'} className="w-full md:w-fit">
              {translation('SetReminderDialog.cancel_button')}
            </Button>
            <Button
              variant="default"
              onClick={handleSetReminder}
              className="w-full md:w-fit"
              disabled={loading}
              size={'lg'}
            >
              {loading
                ? translation('SetReminderDialog.create_button_loading')
                : translation('SetReminderDialog.create_button')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SetReminderDialog
