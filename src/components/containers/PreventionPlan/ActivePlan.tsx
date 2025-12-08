import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import { useLTRServices } from '../../../context/LTRServicesContext'

function ActivePlan() {
  const [translation] = useTranslation('global')
  const { selectedPreventionPlan, setSelectedPreventionPlan } = useLTRServices()
  return (
    <div className="flex flex-col gap-10">
      <Card className="w-full h-fit border shadow-sm border-blue-600 hover:text-blue-600 rounded-lg">
        <CardHeader>
          <Badge
            variant={'outline'}
            className="border-blue-600 bg-white text-blue-600 text-xs font-normal w-fit mb-2"
          >
            Active Plan
          </Badge>
          <CardTitle className="text-lg font-normal text-black">
            {selectedPreventionPlan.heading}
          </CardTitle>
          <CardDescription>{selectedPreventionPlan.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {selectedPreventionPlan.bioMarkers
            .filter((bioMarker: any) => bioMarker !== 'avgWeight')
            .map((bioMarker: any) => (
              <Card
                key={bioMarker}
                className="w-full h-fit border shadow-none hover:shadow-sm border-zinc-300 hover:text-black-600 rounded-sm group"
              >
                <CardHeader>
                  <CardTitle className="text-sm font-normal">
                    {translation(`ActivePreventivePlan.${bioMarker}`)}
                  </CardTitle>
                  <CardDescription className="">
                    {selectedPreventionPlan.PrevetionThresholds &&
                      selectedPreventionPlan.PrevetionThresholds[bioMarker]
                      ? 'optimal' in selectedPreventionPlan.PrevetionThresholds[bioMarker]
                        ? `${selectedPreventionPlan.PrevetionThresholds[
                          bioMarker
                        ].optimal.join(' - ')}`
                        : `${selectedPreventionPlan.PrevetionThresholds[bioMarker].low}`
                      : 'No thresholds set'}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
        </CardContent>
        <CardFooter className=""></CardFooter>
      </Card>
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col">
          <h1 className="text-md font-normal text-black">New Preventive Plan</h1>
          <p className="text-sm text-slate-500">Create a new preventive plan.</p>
        </div>
        <Button
          onClick={() => setSelectedPreventionPlan(null)}
          variant={'outline'}
          size={'default'}
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          New Preventive Plan
        </Button>
      </div>
    </div>
  )
}

export default ActivePlan
