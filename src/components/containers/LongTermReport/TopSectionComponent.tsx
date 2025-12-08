import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import HeadingSubheading from '../../../components/containers/HeadingSubheading'
import { Button } from '../../../components/ui/button'
import { BellRing, FileDownIcon, SquareGanttChartIcon } from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Separator } from '@radix-ui/react-separator'
import { useAuth } from '../../../auth/AuthProvider'
import { Patient } from '@/src/constants/types'
import { useLogSnag } from '@logsnag/react'
import AnomalyDetection from '../AnomalyDetection/AnomalyDetection'
import SendMessageDialog from '../SendMessageDialog'
import { ChatBubbleIcon } from '@radix-ui/react-icons'
import SetReminderDialog from '../SetReminderDialog'

interface TopSectionComponentProps {
  patient: Patient
  formattedDate: string
  loading: boolean
  error: string | null
  openPreventionPlan?: () => void
  style: 'longReport' | 'quickReport'
  isUserOnDashboard?: boolean
  exportPDF: () => void
}

function TopSectionComponent({
  patient,
  formattedDate,
  loading,
  error,
  openPreventionPlan,
  style,
  isUserOnDashboard,
  exportPDF,
}: TopSectionComponentProps) {
  const { isActive, userData } = useAuth()
  const [translation] = useTranslation('global')
  const { track } = useLogSnag()
  const [isSendMessageDialogOpen, setSendMessageDialogOpen] = useState<boolean>(false)
  const [isSetReminderDialogOpen, setReminderDialogOpen] = useState<boolean>(false)

  const openAnomalyDetection = () => {
    track({
      channel: 'clicks',
      event: 'The user has opened the thresholds form',
      icon: '👆',
    })
  }
  const openMessageDialog = () => {
    setSendMessageDialogOpen(true)
  }
  const openReminderDialog = () => {
    setReminderDialogOpen(true)
  }

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     try {
  //       const docRef = doc(db, 'patients', patient.id, 'notificationTokens')

  //       const docSnap = await getDoc(docRef)

  //       if (docSnap.exists()) {
  //         const data = docSnap.data()
  //         const tokenValue = data.ExponentPushToken

  //         if (tokenValue?.token) {
  //           setToken(tokenValue.token)
  //         }
  //       } else {
  //         console.log('No such document!')
  //       }
  //     } catch (error) {
  //       console.error('Error fetching the token:', error)
  //     }
  //   }

  //   fetchToken() // Call the async function
  // }, [])

  return (
    <div className="w-full flex flex-col">
      {error && (
        <div className="bg-white px-6 py-6 border border-red-600 shadow-sm lg:px-8 lg:py-8 rounded-lg text-black mt-4">
          <div className="flex flex-row gap-1 justify-between items-end">
            <div className="flex flex-col gap-1">
              <Badge
                variant={'destructive'}
                className="h-6 w-fit mb-12 text-xs font-normal hover:bg-red-500"
              >
                {translation('LongTermReportPage.badge_error')}
              </Badge>
              <div className="flex flex-col">
                <h1 className="text-xl font-normal text-red-600">
                  {translation('LongTermReportPage.error_heading')}
                </h1>
                <p className="text-sm font-normal mt-2 text-red-600">
                  {translation('LongTermReportPage.error_subheading')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {patient && !error && isActive && (
        <div>
          <div className="flex flex-col lg:flex-row lg:justify-between">
            <div className="flex flex-col">
              <Badge
                variant={'outline'}
                className="hidden bg-white hover:bg-white rounded-md lg:block w-fit text-sm font-normal lg:mb-4"
              >
                {translation('LongTermReportPage.badge')}
              </Badge>
              <HeadingSubheading
                isUserOnDashboard={isUserOnDashboard}
                heading={`${patient.first_name} ${patient.last_name}`}
                subheading={formattedDate}
              />
            </div>
            <div className="flex mt-8 lg:mt-0 flex-col gap-4 justify-center">
              {style === 'longReport' && (
                <div className="grid grid-cols-2 gap-2 2xl:flex 2xl:flex-row 2xl:gap-2">
                  <Button
                    variant={'secondary'}
                    size={'default'}
                    className="bg-white xl:border-white hover:text-blue-600 hover:border-white hover:bg-transparent w-full"
                    onClick={exportPDF}
                  >
                    <FileDownIcon className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    {translation('LongTermReportPage.download_as_pdf')}
                  </Button>
                  <Button
                    variant={'outline'}
                    size={'default'}
                    className="bg-transparent border-blue-600 text-blue-600 w-full"
                    onClick={openReminderDialog}
                  >
                    <BellRing className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    {translation('SetReminderDialog.create_button')}
                  </Button>
                  <Button
                    variant={'outline'}
                    size={'default'}
                    className="bg-transparent border-blue-600 text-blue-600 w-full"
                    onClick={openMessageDialog}
                  >
                    <ChatBubbleIcon className="w-4 h-4 mr-2" />
                    {translation('MessageHistory.heading')} {patient.first_name}
                  </Button>
                  <Button
                    variant={'outline'}
                    size={'default'}
                    className="bg-transparent border-blue-600 text-blue-600 w-full"
                    onClick={openPreventionPlan}
                  >
                    <SquareGanttChartIcon className="w-4 h-4 mr-2" strokeWidth={1.75} />
                    {translation('LongTermReportPage.preventive_plan')}
                  </Button>
                  <AnomalyDetection userUid={patient.id} onClick={openAnomalyDetection} />
                </div>
              )}
              {style === 'longReport' && (
                <>
                  <SendMessageDialog
                    isOpen={isSendMessageDialogOpen}
                    onClose={() => setSendMessageDialogOpen(false)}
                    healthcareProfessionalsDetails={userData}
                    onSuccess={() => setSendMessageDialogOpen(false)}
                    patient={patient}
                  />
                  <SetReminderDialog
                    isOpen={isSetReminderDialogOpen}
                    onClose={() => setReminderDialogOpen(false)}
                    healthcareProfessionalsDetails={userData}
                    onSuccess={() => setReminderDialogOpen(false)}
                    patient={patient}
                  />
                </>
              )}
            </div>
          </div>
          <Separator className="w-full mt-8 mb-0 lg:mb-8 h-0.5 rounded-xl bg-zinc-100" />
        </div>
      )}
    </div>
  )
}

export default TopSectionComponent
