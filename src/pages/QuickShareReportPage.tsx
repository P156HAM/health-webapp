import TopSectionComponent from '../components/containers/LongTermReport/TopSectionComponent'
import DefaultInnerContainer from '../components/containers/DefaultContainerQuickSharedReport'
import { useQSharedReport } from '../hooks/useQSharedReport'
import { useEffect, useRef, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'
import { useTranslation } from 'react-i18next'
import { AlertDialog } from '@radix-ui/react-alert-dialog'
import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import { Button } from '../components/ui/button'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import DataCalender from '../components/containers/LongTermReport/DataCalender'
import { useAuth } from '../auth/AuthProvider'
import DefaultContainerQuickSharedReport from '../components/containers/DefaultContainerQuickSharedReport'
import { useLogSnag } from '@logsnag/react'

function QuickShareReportPage() {
  const { patient, setPatient, loading, error, subcollections, setSubcollections } =
    useQSharedReport()
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)
  const navigate = useNavigate()
  const { accessRequestId, id } = useParams()
  const { user } = useAuth()
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const tokenFromUrl = queryParams.get('src')
  const isUserOnDashboard = queryParams.get('user') === 'true'
  const [translation] = useTranslation('global')
  const { track } = useLogSnag()

  useEffect(() => {
    if (!accessRequestId) {
      return
    }
    const quickReportRef = doc(db, 'accessRequest', accessRequestId)

    const unsubscribe = onSnapshot(
      quickReportRef,
      (docSnapshot) => {
        if (!docSnapshot.exists()) {
          removeQuickShareData()
        }
      },
      (error) => {
        console.error('Error accessing Firestore document:', error)
      }
    )
    return () => {
      unsubscribe()
    }
  }, [accessRequestId])

  const removeQuickShareData = () => {
    setPatient(null)
    setIsDialogVisible(true)
  }

  useEffect(() => {
    if (!user && isUserOnDashboard) {
      removeQuickShareData()
    }
  }, [user])

  const toLandingPage = () => {
    navigate('/')
  }

  useEffect(() => {
    const start = new Date().getTime()

    const handleBeforeUnload = async () => {
      const end = new Date().getTime()
      const totalTime = (end - start) / 1000

      if (totalTime > 0.7) {
        track({
          channel: 'report-view-time',
          event: 'Viewed Patient quick shared report',
          icon: '⏱️',
          description: `User spent ${totalTime} seconds viewing the patient quick shared report.`,
        })
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      handleBeforeUnload()
    }
  }, [])

  return (
    <DefaultContainerQuickSharedReport>
      <AlertDialog open={isDialogVisible} onOpenChange={setIsDialogVisible}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-medium">
              {translation('landingPage.QuickSharedReport.expired_heading')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-md">
              {translation('landingPage.QuickSharedReport.expired_subheading_1')}
              <br></br>
              <br></br>
              {translation('landingPage.QuickSharedReport.expired_subheading_2')}
            </AlertDialogDescription>
            <div className="flex flex-row justify-end">
              <Button variant="default" className="mt-12" onClick={toLandingPage}>
                {translation('landingPage.QuickSharedReport.expired_button')}
              </Button>
            </div>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
      {!patient ? (
        <div className="flex-grow h-full flex items-center justify-center">
          <p className="text-lg font-normal mr-3">{translation('landingPage.Login.loading')}</p>
          <span className="dot text-xl text-black/50">.</span>
          <span className="dot text-xl text-black/50">.</span>
          <span className="dot text-xl text-black/50">.</span>
        </div>
      ) : (
        patient && (
          <div className="flex-grow h-full overflow-auto px-6 py-6 lg:px-20 lg:py-24 bg-white">
            <TopSectionComponent
              patient={patient}
              formattedDate={patient.date_of_birth}
              loading={loading}
              error={error}
              style="quickReport"
              isUserOnDashboard={isUserOnDashboard}
              exportPDF={() => { }}
            />
            <DefaultInnerContainer>
              <DataCalender
                data={subcollections}
                id={id}
                url={'/quick-shared-report/daily'}
                accessRequestId={accessRequestId}
                decryptedRequestId={tokenFromUrl || undefined}
              />
            </DefaultInnerContainer>
          </div>
        )
      )}
    </DefaultContainerQuickSharedReport>
  )
}

export default QuickShareReportPage
