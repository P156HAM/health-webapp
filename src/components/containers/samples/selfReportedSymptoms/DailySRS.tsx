import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import type { SelfReportedSymptoms } from '../../../../../src/constants/types'
import { Timestamp } from 'firebase/firestore'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface DailySelfReportedSymptomsprops {
  data: any
}

function DailySelfReportedSymptoms({ data }: DailySelfReportedSymptomsprops) {

  const [translation] = useTranslation('global')

  const dailySelfReportedSymptoms: SelfReportedSymptoms[] = data.selfReportedSymptoms
  dailySelfReportedSymptoms.sort((a: SelfReportedSymptoms, b: SelfReportedSymptoms) => {
    const dateA = a.DateAndTime instanceof Timestamp ? a.DateAndTime.toDate() : new Date(a.DateAndTime._seconds * 1000);
    const dateB = b.DateAndTime instanceof Timestamp ? b.DateAndTime.toDate() : new Date(b.DateAndTime._seconds * 1000);
    return dateA.getTime() - dateB.getTime();
  });

  useEffect(() => {
  }, [])

  const dailySelfReportedSymptom =
    dailySelfReportedSymptoms && dailySelfReportedSymptoms.length > 0
      ? dailySelfReportedSymptoms.map((sample: SelfReportedSymptoms) => ({
        date:
          sample.DateAndTime !== undefined
            ? sample.DateAndTime instanceof Timestamp
              ? sample.DateAndTime.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
              : new Date(sample.DateAndTime._seconds * 1000).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
        text: sample.text !== undefined ? sample.text : '',
        type: sample.DateAndTime && sample.text ? 'SRS' : '',
      }))
      : []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('SelfReportedSymptomsBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">{translation('SelfReportedSymptomsBiomarker.subheading')}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
        {dailySelfReportedSymptom.map((symptom, index) => (
          <SectionWithHoverCard key={index} title={symptom.date} data={symptom.text} type={'SRS'} />
        ))}
      </div>
    </div>
  )
}

export default DailySelfReportedSymptoms
