import React, { useEffect } from 'react'
import DailySleep from '../samples/sleep/DailySleep'
import DailyHeartRate from '../samples/heartRate/DailyHeartRate'
import { Separator } from '../../ui/separator'
import DailyActivity from '../samples/activity/DailyActivity'
import DailyBloodPressure from '../samples/bloodPressure/DailyBloodPressure'
import DailySelfReportedSymptoms from '../samples/selfReportedSymptoms/DailySRS'
import DailyWeight from '../samples/weight/DailyWeight'
import DailyScores from '../samples/others/DailyScores'

interface SamplesContainerProps {
  data: any
}

function SamplesContainer({ data }: SamplesContainerProps) {
  return (
    <div>
      {data.selfReportedSymptoms && data.selfReportedSymptoms.length > 0 && (
        <>
          <DailySelfReportedSymptoms data={data} />
          <Separator className="mt-16 mb-16" />
        </>
      )}
      <DailyHeartRate data={data} />
      <Separator className="mt-16 mb-16" />
      <DailySleep data={data} />
      <Separator className="mt-16 mb-16" />
      <DailyActivity data={data} />
      <Separator className="mt-16 mb-16" />
      <DailyWeight data={data} />
      <Separator className="mt-16 mb-16" />
      <DailyBloodPressure data={data} />
      <Separator className="mt-16 mb-16" />
      <DailyScores data={data} />
    </div>
  )
}

export default SamplesContainer
