import { useState } from 'react'
import { Button } from '../../ui/button'
import { useTranslation } from 'react-i18next'
import AnomalyCheckboxForm from './AnomalycheckboxForm'
import { RadiobuttonIcon } from '@radix-ui/react-icons'

interface AnomalyDetectionProps {
  userUid: string
  onClick: () => void
}

const AnomalyDetection = ({ userUid }: AnomalyDetectionProps) => {
  const [translation] = useTranslation('global')
  const [triggerDialog, setTriggerDialog] = useState<(() => void) | null>(null)

  const handleOpenDialog = () => {
    if (triggerDialog) {
      triggerDialog()
    }
  }

  return (
    <>
      <Button variant={'default'}
        size={'default'}
        className="col-span-2 w-full"
        onClick={handleOpenDialog}>
        <RadiobuttonIcon className="w-4 h-4 mr-2" />
        {translation('LongTermReportPage.anomaly_detection')}
      </Button>
      <AnomalyCheckboxForm setTriggerDialog={setTriggerDialog} userUid={userUid} />
    </>
  )
}

export default AnomalyDetection
