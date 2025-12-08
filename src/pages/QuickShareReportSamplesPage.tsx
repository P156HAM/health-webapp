import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/AuthenticationAnimation.css'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import { useNavigate, useParams } from 'react-router-dom'
import TopSectionComponent from '../components/containers/LongTermReport/TopSectionComponent'
import SamplesContainer from '../components/containers/LongTermReport/SamplesContainer'
import { useQSharedReport } from '../hooks/useQSharedReport'
import { Button } from '../components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/firebase'

function QuickSharedReportSamplesPage() {
  const [translation] = useTranslation('global')
  const { date } = useParams<{ id: string; date: string }>()
  const {
    patient,
    dailySamplesData,
    samplesLoading,
    samplesError,
    getSamples,
    setDailySamplesData,
    setPatient,
  } = useQSharedReport()
  const [isDialogVisible, setIsDialogVisible] = useState<boolean>(false)
  const [accessRequestId, setAccessRequestId] = useState<null | string>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search)
  const data = params.get('data')

  useEffect(() => {
    if (!data) {
      return
    }
    const parsedData = JSON.parse(decodeURIComponent(data))
    setAccessRequestId(parsedData)
  }, [])

  useEffect(() => {
    if (!date) {
      return
    }
    getSamples(date)
  }, [])

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
    setIsDialogVisible(true)
    setDailySamplesData(null)
    setPatient(null)
  }

  useEffect(() => {
    if (isDialogVisible && triggerRef.current) {
      triggerRef.current.click()
    }
  }, [isDialogVisible])

  const toLandingPage = () => {
    navigate('/')
  }

  return (
    <>
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
      {!isDialogVisible && (
        <div className="flex-grow h-full overflow-auto px-6 py-6 lg:px-20 lg:py-16 bg-white">
          {!dailySamplesData && !patient && samplesLoading && (
            <div className="flex flex-col justify-center items-center w-full min-h-screen bg-slate-100 rounded-sm">
              <div className="flex flex-row items-center">
                <p className="text-lg text-normal text-black/50 mr-2">
                  {translation('landingPage.QuickSharedReport.loading_qsr_daily')}
                </p>
                <span className="dot text-xl text-black/50">.</span>
                <span className="dot text-xl text-black/50">.</span>
                <span className="dot text-xl text-black/50">.</span>
              </div>
            </div>
          )}
          {dailySamplesData && patient && (
            <div className="bg-white mb-8">
              <TopSectionComponent
                patient={patient}
                formattedDate={dailySamplesData.patient.date_of_birth}
                loading={samplesLoading}
                error={samplesError}
                style="quickReport"
                exportPDF={() => { }}
              />

              <DefaultInnerContainer>
                <SamplesContainer data={dailySamplesData} />
              </DefaultInnerContainer>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default QuickSharedReportSamplesPage
