import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card'
import { Button } from '../../ui/button'
import { useLTRServices } from '../../../context/LTRServicesContext'
import PreventionThresholdsForm from './PreventiveThresholdsForm'
import { useEffect, useState } from 'react'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { useParams } from 'react-router-dom'
import { db } from '../../../firebase/firebase'
import { PreventionMetricKey, Thresholds } from '@/src/constants/types'

interface GridCardsProps {
  onClose: () => void
}
function GridCards({ onClose }: GridCardsProps) {
  const [translation] = useTranslation('global')
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const { fetchPreventionPlans } = useLTRServices()
  const [selectedPlan, setSelectedPlan] = useState<{
    heading: string
    description: string
    bioMarkers: PreventionMetricKey[]
    thresholds: Thresholds
  } | null>(null)

  const preventivePlans = [
    {
      heading: 'Tired / Fatigue',
      description: 'Preventive plan tailored for tiredness & fatigue.',
      bioMarkers: [
        'sleepDuration',
        'steps',
        'distance',
        'avgSaturation',
        'avgWeight',
        'avgHeartRate',
      ],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Sleep',
      description: 'Preventive plan tailored for sleep.',
      bioMarkers: [
        'sleepDuration',
        'steps',
        'distance',
        'avgSaturation',
        'avgHeartRate',
        'avgWeight',
      ],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Obesity',
      description: 'Preventive plan tailored for obesity.',
      bioMarkers: ['avgWeight', 'sleepDuration', 'steps', 'distance', 'avgSaturation', 'hrv'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Chronic Pain',
      description: 'Preventive plan tailored for chronic pain.',
      bioMarkers: ['sleepDuration', 'steps', 'avgWeight', 'avgHeartRate', 'distance'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Depression',
      description: 'Preventive plan tailored for depression.',
      bioMarkers: ['steps', 'distance', 'sleepDuration', 'avgWeight', 'hrv', 'avgHeartRate'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Pre-Diabetes / Atherosklerosis',
      description: 'Preventive plan tailored for pre-diaetes and/or atherosklerosis.',
      bioMarkers: ['steps', 'distance', 'avgHeartRate', 'avgWeight', 'sleepDuration', 'avgBreaths'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Impotency',
      description: 'Preventive plan tailored for impotency.',
      bioMarkers: ['steps', 'sleepDuration', 'avgWeight', 'distance', 'hrv'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'General Health',
      description: 'Preventive plan tailored for general health.',
      bioMarkers: ['sleepDuration', 'steps', 'distance', 'avgHeartRate', 'hrv', 'avgWeight'],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
    {
      heading: 'Define Your Own',
      description: 'Define the preventive plan as you wish.',
      bioMarkers: [
        'steps',
        'distance',
        'sleepDuration',
        'avgHeartRate',
        'avgBreaths',
        'avgSaturation',
        'avgWeight',
        'hrv',
      ],
      thresholds: {
        avgWeight: { optimal: [0, 2000] },
      },
    },
  ]

  const handleSelectPreventionPlan = (plan: any) => {
    setSelectedPlan(plan)
    //console.log('Selecting preventive plan:', plan)
  }

  const handleSubmitPlan = async (plan: any) => {
    if (!id) {
      return
    }

    setLoading(true)

    try {
      const docRef = doc(collection(db, 'patients', id, 'preventivePlans'))
      await setDoc(docRef, {
        preventionPlan: plan,
        createdAt: new Date(),
      })
      //console.log('Plan successfully written to Firestore')

      // Fetch the latest plan after writing
      await fetchPreventionPlans(id)
    } catch (error) {
      //console.error('Error writing document: ', error)
    } finally {
      setLoading(false)
      setSelectedPlan(null)
      onClose()
    }
  }

  return (
    <div>
      {selectedPlan ? (
        <>
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-xl">{selectedPlan.heading}</h1>
            <p className="text-sm">{selectedPlan.description}</p>
          </div>
          <PreventionThresholdsForm
            plan={selectedPlan}
            onSubmit={handleSubmitPlan}
            loading={loading}
          />
        </>
      ) : (
        <>
          <div className="flex flex-col mb-4">
            <h1 className="text-lg font-normal">{translation('PreventivePlans.heading')}</h1>
            <p className="text-sm font-normal text-stone-500">
              {translation('PreventivePlans.subheading')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {preventivePlans.map((plan, index) => (
              <Card
                key={index}
                className="w-full h-fit border shadow-sm hover:shadow-sm hover:border-zinc-300 hover:text-black-600 rounded-lg group"
              >
                <CardHeader>
                  <CardTitle className="text-md font-normal">{plan.heading}</CardTitle>
                  <CardDescription className="">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent></CardContent>
                <CardFooter className="w-full">
                  <Button
                    onClick={() => handleSelectPreventionPlan(plan)}
                    size={'sm'}
                    variant={'outline'}
                    className="w-fit text-xs font-normal group-hover:bg-blue-600 group-hover:text-white"
                  >
                    {translation('PreventivePlans.select_template')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default GridCards
