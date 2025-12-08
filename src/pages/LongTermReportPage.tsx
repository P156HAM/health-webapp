import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PDFExport, savePDF } from "@progress/kendo-react-pdf"
import '../styles/AuthenticationAnimation.css'
import DefaultContainer from '../components/containers/LongTermReport/DefaultContainerReport'
import { useAuth } from '../auth/AuthProvider'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import { useParams } from 'react-router-dom'
import InactiveComponent from '../components/containers/LongTermReport/InactiveComponent'
import TopSectionComponent from '../components/containers/LongTermReport/TopSectionComponent'
import PreventionPlanComponent from '../components/containers/PreventionPlan/PreventionPlanComponent'
import DataCalender from '../components/containers/LongTermReport/DataCalender'
import { useLTRServices } from '../context/LTRServicesContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import PreventionPlanCalender from '../components/containers/PreventionPlan/PreventionPlanCalender'
import { SquareGanttChartIcon } from 'lucide-react'
import { useLogSnag } from '@logsnag/react'

function LongTermReportPage() {
  const { userData } = useAuth()
  const [translation] = useTranslation('global')
  const { id } = useParams<{ id: string }>()
  const [isPreventionPlanOpen, setIsPreventionPlanOpen] = useState(false)
  const { data, loading, error, fetchPatientData, selectedPreventionPlan, fetchPreventionPlans } =
    useLTRServices()
  const [loadingData, setLoadingData] = useState(false)
  const { track } = useLogSnag()
  const pdfExportComponent = useRef<PDFExport>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) {
      return
    }
    const fetchData = async () => {
      setLoadingData(true)
      await fetchPatientData(id)
      await fetchPreventionPlans(id)
      setLoadingData(false)
    }
    fetchData()
  }, [id])

  const openPreventionPlan = () => {
    setIsPreventionPlanOpen(true)
  }

  const closePreventionPlan = () => {
    setIsPreventionPlanOpen(false)
  }

  const exportPDF = () => {
    if (contentRef.current) {
      const content = contentRef.current
      const originalStyle = content.style.cssText

      // Temporarily adjust styles for PDF export
      content.style.height = 'auto'
      content.style.overflow = 'visible'
      content.style.position = 'relative'

      savePDF(content, {
        paperSize: "auto",
        margin: 40,
        fileName: `${data?.patient.first_name}_${data?.patient.last_name}_${new Date().toLocaleDateString()}_Vizu_Health.pdf`
      });

      // Restore original styles
      content.style.cssText = originalStyle
    }
  }

  useEffect(() => {
    document.title = 'Overview | Vizu Health'
  }, [])

  useEffect(() => {
    const start = new Date().getTime()

    const handleBeforeUnload = async () => {
      const end = new Date().getTime()
      const totalTime = (end - start) / 1000

      if (totalTime > 0.7) {
        track({
          channel: 'report-view-time',
          event: 'Viewed Patient Report',
          icon: '⏱️',
          description: `User spent ${totalTime} seconds viewing the patient report.`,
          tags: {
            userid: `${userData?.email}`,
          },
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
    <DefaultContainer>
      {!userData?.isActive && <InactiveComponent />}
      {(loadingData || (!data && userData?.isActive)) && (
        <div className="flex flex-col justify-center align-center items-center w-full h-full bg-slate-100 rounded-sm animate-pulse">
          <div className="flex flex-row">
            <p className="text-lg text-normal text-black/50 mr-2">Fetching Report</p>
            <span className="dot text-xl text-black/50">.</span>
            <span className="dot text-xl text-black/50">.</span>
            <span className="dot text-xl text-black/50">.</span>
          </div>
        </div>
      )}
      {!loadingData && data && userData?.isActive && (
        <div ref={contentRef} className="pdf-export-content">
          <div>
            <TopSectionComponent
              patient={data.patient}
              formattedDate={data.patient.date_of_birth}
              loading={loading}
              error={error}
              openPreventionPlan={openPreventionPlan}
              style="longReport"
              exportPDF={exportPDF}
            />

            <DefaultInnerContainer>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="w-full md:w-fit mb-8">
                  <TabsTrigger value="general" className="w-full">
                    <p className="font-normal">
                      {translation('LongTermReportPage.general_calendar_tabs')}
                    </p>
                  </TabsTrigger>

                  <TabsTrigger value="prevention_plan" className="w-full">
                    {selectedPreventionPlan != null && (
                      <div className="flex flex-row items-center">
                        <span className="relative flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-600 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                        </span>
                        <p className="font-normal">
                          {translation('LongTermReportPage.preventive_plan_tabs')}
                        </p>
                      </div>
                    )}
                    {selectedPreventionPlan === null && (
                      <div className="flex flex-row items-center">
                        <SquareGanttChartIcon className="w-4 h-4 mr-2" />
                        <p className="font-normal">
                          {translation('LongTermReportPage.preventive_plan_tabs')}
                        </p>
                      </div>
                    )}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="general">
                  <DataCalender data={data} id={id} url={'/report/daily'} />
                </TabsContent>
                <TabsContent value="prevention_plan">
                  <PreventionPlanCalender
                    data={data}
                    id={id}
                    preventionPlan={selectedPreventionPlan}
                  />
                </TabsContent>
              </Tabs>
            </DefaultInnerContainer>

            {isPreventionPlanOpen && (
              <PreventionPlanComponent
                isOpen={isPreventionPlanOpen}
                onClose={closePreventionPlan}
                patient={data.patient}
                selectedPreventionPlan={selectedPreventionPlan}
              />
            )}
          </div>
        </div>
      )}
    </DefaultContainer>
  )
}

export default LongTermReportPage
