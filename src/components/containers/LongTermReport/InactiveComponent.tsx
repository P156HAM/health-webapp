import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../../auth/AuthProvider'
import { useParams } from 'react-router-dom'
import { useFetchPatient } from '../../../hooks/useFetchPatient' // Import the custom hook
import { Badge } from '../../ui/badge'

function InactiveComponent() {
  const { userData } = useAuth()
  const [translation] = useTranslation('global')
  const [formattedDate, setFormattedDate] = useState('')
  const { id } = useParams()
  const { patient, loading, error } = useFetchPatient(id!)

  return (
    <div className="bg-white px-6 py-6 border shadow-sm lg:px-8 lg:py-8 rounded-lg text-black mt-4">
      <div className="flex flex-row gap-1 justify-between items-end">
        <div className="flex flex-col gap-1">
          <Badge
            variant={'outline'}
            className="h-6 w-fit mb-12 text-xs font-normal bg-blue-600 border-blue-600 text-white shadow-sm"
          >
            {translation('onboarding.premium_feature')}
          </Badge>
          <div className="flex flex-col">
            {patient && (
              <div className="flex flex-row gap-4">
                <h1 className="text-xl font-normal text-stone-500">
                  {patient!.first_name} {patient!.last_name}
                </h1>
                <Badge variant={'outline'} className="w-fit text-xs text-stone-400 font-normal">
                  {formattedDate}
                </Badge>
              </div>
            )}
            {!patient && (
              <h1 className="text-xl font-normal text-stone-500">
                {translation('LongTermReportPage.access_denied_heading')}
              </h1>
            )}
            <p className="text-sm font-normal mt-2 text-stone-400">
              {translation('LongTermReportPage.access_denied_subheading')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InactiveComponent
