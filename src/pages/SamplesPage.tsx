import React, { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '../styles/AuthenticationAnimation.css'
import DefaultContainer from '../components/containers/LongTermReport/DefaultContainerReport'
import { useAuth } from '../auth/AuthProvider'
import DefaultInnerContainer from '../components/containers/DefaultInnerContainer'
import { useParams } from 'react-router-dom'
import InactiveComponent from '../components/containers/LongTermReport/InactiveComponent'
import TopSectionComponent from '../components/containers/LongTermReport/TopSectionComponent'
import PreventionPlanComponent from '../components/containers/PreventionPlan/PreventionPlanComponent'
import useGetSamples from '../hooks/useGetSamples'
import SamplesContainer from '../components/containers/LongTermReport/SamplesContainer'
import { PDFExport } from "@progress/kendo-react-pdf";

function SamplesPage() {
  const { userData } = useAuth()
  const [translation] = useTranslation('global')
  const { id, date } = useParams<{ id: string; date: string }>()
  const [isPreventionPlanOpen, setIsPreventionPlanOpen] = useState(false)
  const { data, loading, error } = useGetSamples(id, date)
  const pdfExportComponent = useRef<PDFExport>(null);

  const openPreventionPlan = () => {
    setIsPreventionPlanOpen(true)
  }

  const closePreventionPlan = () => {
    setIsPreventionPlanOpen(false)
  }

  const exportPDF = () => {
    if (pdfExportComponent.current) {
      pdfExportComponent.current.save();
    }
  };

  useEffect(() => {
    document.title = date + ' | Daily Report | Vizu Health'
  })

  return (
    <DefaultContainer>
      {!userData?.isActive && <InactiveComponent />}
      {!data && userData?.isActive && (
        <div className="flex flex-col justify-center align-center items-center w-full h-full bg-slate-100 rounded-sm animate-pulse">
          <div className="flex flex-row">
            <p className="text-lg text-normal text-black/50 mr-2">Fetching Report</p>
            <span className="dot text-xl text-black/50">.</span>
            <span className="dot text-xl text-black/50">.</span>
            <span className="dot text-xl text-black/50">.</span>
          </div>
        </div>
      )}

      {data && data.patient && userData?.isActive && (
        <PDFExport ref={pdfExportComponent} paperSize="auto" margin={40} fileName={`${data?.patient.first_name}_${data?.patient.last_name}_${new Date().toLocaleDateString()}_Vizu_Health.pdf`}>

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
              <SamplesContainer data={data} />
            </DefaultInnerContainer>

            {isPreventionPlanOpen && (
              <PreventionPlanComponent
                isOpen={isPreventionPlanOpen}
                onClose={closePreventionPlan}
                patient={data.patient}
              />
            )}
          </div>
        </PDFExport >
      )}
    </DefaultContainer>
  )
}

export default SamplesPage
