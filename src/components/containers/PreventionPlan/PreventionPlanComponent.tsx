import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/preventive-plan-dialog'
import GridCards from './GridCards'
import ActivePlan from './ActivePlan'
import { Patient } from '@/src/constants/types'

interface PreventionPlanComponentProps {
  isOpen: boolean
  onClose: () => void
  patient: Patient
  selectedPreventionPlan?: any
}

const PreventionPlanComponent: React.FC<PreventionPlanComponentProps> = ({
  isOpen,
  onClose,
  patient,
  selectedPreventionPlan,
}) => {
  const [translation] = useTranslation('global')
  const [currentSection, setCurrentSection] = useState({
    section: 'main',
    title: '',
    description: '',
  })

  const renderSection = (title: string, description: string, content: React.ReactNode) => (
    <>
      <DialogHeader className="mb-8">
        <DialogTitle className="text-3xl font-medium text-left mb-1">{title}</DialogTitle>
        <DialogDescription className="text-black text-md text-left mt-2">
          {description}
        </DialogDescription>
      </DialogHeader>
      {content}
    </>
  )

  const renderContent = () => {
    switch (currentSection.section) {
      case 'main':
        return renderSection(
          'Personal Preventive Plan',
          `Use one of the predefined templates or define your own preventive plan for ${patient.first_name}.`,
          <div>
            {/** Case 1  */}
            {/** No plan set yet  */}
            {!selectedPreventionPlan && <GridCards onClose={onClose} />}

            {/** Case 2  */}
            {/** Showing Active Plan + Ability To Create New Plan*/}
            {/** In the future we will also show previously set plans*/}
            {selectedPreventionPlan && <ActivePlan />}
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="px-8 py-10 max-h-[100vh] lg:max-h-[85vh] overflow-y-auto text-left">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}

export default PreventionPlanComponent
