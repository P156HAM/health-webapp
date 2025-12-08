import SectionWithHoverCard from '../../../../components/ui/SectionWithHoverCard'
import { BloodPressureSample, BodyBloodPressureSamples } from '../../../../../src/constants/types'
import React from 'react'
import { ClockIcon } from '@radix-ui/react-icons';
import { useTranslation } from 'react-i18next'

interface DailyBloodPressureProps {
  data: any
}

function DailyBloodPressure({ data }: DailyBloodPressureProps) {
  const [translation] = useTranslation('global')
  const dailyBloodPressureSamples: BodyBloodPressureSamples = data.bodyBloodPressureSamples;

  const dailyBloodPressure = dailyBloodPressureSamples && dailyBloodPressureSamples.blood_pressure_samples.length > 0
    ? dailyBloodPressureSamples.blood_pressure_samples.map(
      (sample: BloodPressureSample) => ({
        diastolic_bp: sample.diastolic_bp !== undefined ? `${sample.diastolic_bp} mmHg` : translation('LongTermReportPage.no_data'),
        systolic_bp: sample.systolic_bp !== undefined ? `${sample.systolic_bp} mmHg` : translation('LongTermReportPage.no_data'),
        timeStamp: sample.timestamp
          ? new Date(sample.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          : translation('LongTermReportPage.no_data'),
      })
    )
    : [{ diastolic_bp: translation('LongTermReportPage.no_data'), systolic_bp: translation('LongTermReportPage.no_data'), timeStamp: translation('LongTermReportPage.no_data') }];


  const groupedByTime = dailyBloodPressure.reduce(
    (acc, sample) => {
      const time = sample.timeStamp
      if (!acc[time]) {
        acc[time] = []
      }
      acc[time].push(sample)
      return acc
    },
    {} as Record<string, typeof dailyBloodPressure>
  )

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-normal text-black">{translation('BloodPressureBiomarker.heading')}</h1>
        <p className="text-md text-slate-500">{translation('BloodPressureBiomarker.subheading')}</p>
      </div>
      <div className="grid gap-y-4">
        {Object.entries(groupedByTime).map(([time, samples]) => (
          <div key={time} className="col-span-2 md:col-span-3 xl:col-span-4">
            <h2 className="flex flex-row text-sm font-normal mb-2 items-center">
              <ClockIcon className='w-4 h-4 mr-2' />
              {time}
            </h2>
            <div className="grid">
              {samples.map((bp, index) => (
                <React.Fragment key={index}>
                  {index % 2 === 0 && index !== 0 && <div className="h-4" />}
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4">
                    <SectionWithHoverCard title={translation('BloodPressureBiomarker.diastolic')} data={bp.diastolic_bp} />
                    <SectionWithHoverCard title={translation('BloodPressureBiomarker.systolic')} data={bp.systolic_bp} />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DailyBloodPressure
