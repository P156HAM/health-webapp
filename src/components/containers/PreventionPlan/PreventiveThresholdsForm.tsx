import { useState } from 'react'
import { Button } from '../../ui/button'
import { PreventionThresholds, PreventionMetricKey } from '@/src/constants/types'
import { Input } from 'src/components/ui/input'
import { useTranslation } from 'react-i18next'

interface PreventionThresholdsFormProps {
  plan: any
  onThresholdChange?: (
    metric: PreventionMetricKey,
    key: string,
    value: number | [number, number]
  ) => void
  onSubmit: (plan: any) => void
  loading: boolean
}

const PreventionThresholdsForm: React.FC<PreventionThresholdsFormProps> = ({
  plan,
  onSubmit,
  loading,
}) => {
  const [translation] = useTranslation('global')
  const [PrevetionThresholds, setPrevetionThresholds] = useState<PreventionThresholds>(
    plan.PrevetionThresholds || {}
  )
  const [error, setError] = useState('')
  const handleThresholdChange = (
    metric: PreventionMetricKey,
    key: string,
    value: number,
    index?: number
  ) => {
    if (value < 0) {
      setError('Value cannot be negative')
      return
    }

    setError('')

    if (metric === 'steps' || metric === 'avgSaturation' || metric === 'distance') {
      setPrevetionThresholds((prev) => ({
        ...prev,
        [metric]: { ...prev[metric], [key]: value },
      }))
    } else {
      const currentValues = PrevetionThresholds[metric]?.[key as 'optimal'] || [0, 0]
      const newValue: [number, number] = [
        index === 0 ? value : currentValues[0],
        index === 1 ? value : currentValues[1],
      ]
      setPrevetionThresholds((prev) => ({
        ...prev,
        [metric]: { ...prev[metric], [key]: newValue },
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedPlan = { ...plan, PrevetionThresholds }
    //console.log('Form submitted')
    onSubmit(updatedPlan)
    //console.log('Submitted PrevetionThresholds:', PrevetionThresholds)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col md:grid md:grid-cols-2 gap-x-4 gap-y-4 pb-8">
        {plan.bioMarkers
          .filter((bioMarker: PreventionMetricKey) => bioMarker !== 'avgWeight')
          .map((bioMarker: PreventionMetricKey) => (
            <div
              key={bioMarker}
              className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md"
            >
              <label htmlFor={`${bioMarker}Low`} className="block text-md font-normal">
                {translation(`ActivePreventivePlan.${bioMarker}`)}
              </label>
              <p className="text-sm text-gray-500 mt-1">
                {translation(`PreventiveThresholdForm.${bioMarker}_subheading`)}
              </p>
              {bioMarker === 'steps' ||
                bioMarker === 'avgSaturation' ||
                bioMarker === 'distance' ? (
                <div className="flex space-x-2 mt-8">
                  <Input
                    id={`${bioMarker}Low`}
                    type="number"
                    value={PrevetionThresholds[bioMarker]?.low || ''}
                    onChange={(e) =>
                      handleThresholdChange(bioMarker, 'low', Number(e.target.value))
                    }
                    className="bg-white"
                    placeholder="Low threshold"
                    min="0"
                  />
                </div>
              ) : (
                <div className="flex space-x-2 mt-8">
                  <Input
                    id={`${bioMarker}OptimalLow`}
                    type="number"
                    value={PrevetionThresholds[bioMarker]?.optimal?.[0] || ''}
                    onChange={(e) =>
                      handleThresholdChange(bioMarker, 'optimal', Number(e.target.value), 0)
                    }
                    className="bg-white"
                    placeholder="Min"
                    min="0"
                  />
                  <Input
                    id={`${bioMarker}OptimalHigh`}
                    type="number"
                    value={PrevetionThresholds[bioMarker]?.optimal?.[1] || ''}
                    onChange={(e) =>
                      handleThresholdChange(bioMarker, 'optimal', Number(e.target.value), 1)
                    }
                    className="bg-white"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              )}
            </div>
          ))}
      </div>
      {error && (
        <div className="bg-red-100 px-4 py-4 rounded-sm">
          <p className="w-full text-red-600">{error}</p>
        </div>
      )}
      <div className="w-full text-right">
        <Button
          type="submit"
          variant={loading ? 'ghost' : 'default'}
          size={'lg'}
          className="mt-8 w-fit"
        >
          Confirm Thresholds
        </Button>
      </div>
    </form>
  )
}

export default PreventionThresholdsForm
