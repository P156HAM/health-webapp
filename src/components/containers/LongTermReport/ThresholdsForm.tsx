import { useState } from 'react'
import { Button } from '../../ui/button'
import { DialogClose } from '../../../components/ui/dialog'
import { Thresholds, MetricKey } from '@/src/constants/types'
import { Input } from 'src/components/ui/input'
import { useTranslation } from 'react-i18next'

interface ThresholdFormProps {
  thresholds: Thresholds
  onThresholdChange: (metric: MetricKey, key: string, value: number | [number, number]) => void
  onSubmit: (e: React.FormEvent) => void
}

const ThresholdForm: React.FC<ThresholdFormProps> = ({
  thresholds,
  onThresholdChange,
  onSubmit,
}) => {
  const [error, setError] = useState('')

  const handleThresholdChange = (metric: MetricKey, key: string, value: number, index?: number) => {
    if (value < 0) {
      setError('Value cannot be negative')
      return
    }

    setError('')

    if (metric === 'steps' || metric === 'activeMinutes' || metric === 'avgSaturation') {
      onThresholdChange(metric, key, value)
    } else if (
      metric === 'sleepDuration' ||
      metric === 'avgHeartRate' ||
      metric === 'avgWeight' ||
      metric === 'bloodPressureSys' ||
      metric === 'bloodPressureDys' ||
      metric === 'avgBreaths'
    ) {
      const currentValues = thresholds[metric]?.[key as 'optimal'] || [0, 0]
      const newValue: [number, number] = [
        index === 0 ? value : currentValues[0],
        index === 1 ? value : currentValues[1],
      ]
      // if (newValue[1] < newValue[0] && currentValues[0] !== 0 && currentValues[1] !== 0) {
      //   setError('Max value must be greater than min value')
      //   return
      // }
      onThresholdChange(metric, key, newValue)
    }
  }

  const [translation] = useTranslation('global')

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col md:grid md:grid-cols-3 gap-x-4 gap-y-4 pb-8">
        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="sleepDurationOptimalLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_sleep_duration')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.sleep_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="sleepDurationOptimalLow"
              type="number"
              value={thresholds.sleepDuration?.optimal[0] || ''}
              onChange={(e) =>
                handleThresholdChange('sleepDuration', 'optimal', Number(e.target.value), 0)
              }
              className="bg-white"
              placeholder="Min:"
              min="0"
            />
            <Input
              id="sleepDurationOptimalHigh"
              type="number"
              value={thresholds.sleepDuration?.optimal[1] || ''}
              onChange={(e) =>
                handleThresholdChange('sleepDuration', 'optimal', Number(e.target.value), 1)
              }
              className="bg-white"
              placeholder="Max:"
              min="0"
            />
          </div>
        </div>
        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="stepsLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_steps')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.steps_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="stepsLow"
              type="number"
              value={thresholds.steps?.low || ''}
              onChange={(e) => handleThresholdChange('steps', 'low', Number(e.target.value))}
              className="bg-white"
              placeholder="Daily steps"
              min="0"
            />
          </div>
        </div>

        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="activeMinutesLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_active_minutes')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.active_minutes_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="activeMinutesLow"
              type="number"
              value={thresholds.activeMinutes?.low || ''}
              onChange={(e) =>
                handleThresholdChange('activeMinutes', 'low', Number(e.target.value))
              }
              className="bg-white"
              placeholder="Daily active minutes"
              min="0"
            />
          </div>
        </div>

        {/* Second Row*/}
        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="activeMinutesLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_saturation')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.saturation_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="avgSaturationLow"
              type="number"
              value={thresholds.avgSaturation?.low || ''}
              onChange={(e) =>
                handleThresholdChange('avgSaturation', 'low', Number(e.target.value))
              }
              className="bg-white"
              placeholder="Saturation level (%)"
              min="85"
            />
          </div>
        </div>

        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="avgHeartRateOptimalLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_avg_heart_rate')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.heart_rate_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="avgHeartRateOptimalLow"
              type="number"
              value={thresholds.avgHeartRate?.optimal[0] || ''}
              onChange={(e) =>
                handleThresholdChange('avgHeartRate', 'optimal', Number(e.target.value), 0)
              }
              className="bg-white"
              placeholder="Min. Avg. Heart Rate (bpm)"
              min="0"
            />
            <Input
              id="avgHeartRateOptimalHigh"
              type="number"
              value={thresholds.avgHeartRate?.optimal[1] || ''}
              onChange={(e) =>
                handleThresholdChange('avgHeartRate', 'optimal', Number(e.target.value), 1)
              }
              className="bg-white"
              placeholder="Max. Avg. Heart Rate (bpm)"
              min="0"
            />
          </div>
        </div>

        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="avgHeartRateOptimalLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_respiration')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.respiration_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="avgBreathsOptimalLow"
              type="number"
              value={thresholds.avgBreaths?.optimal[0] || ''}
              onChange={(e) =>
                handleThresholdChange('avgBreaths', 'optimal', Number(e.target.value), 0)
              }
              className="bg-white"
              placeholder="Min. Breaths per Minute"
              min="0"
            />
            <Input
              id="avgBreathsOptimalHigh"
              type="number"
              value={thresholds.avgBreaths?.optimal[1] || ''}
              onChange={(e) =>
                handleThresholdChange('avgBreaths', 'optimal', Number(e.target.value), 1)
              }
              className="bg-white"
              placeholder="Max. Breaths per Minute"
              min="0"
            />
          </div>
        </div>

        {/* Third */}
        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="avgHeartRateOptimalLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_blood_pressure_systolic')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.blood_pressure_systolic_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="bloodPressureOptimalLow"
              type="number"
              value={thresholds.bloodPressureSys?.optimal[0] || ''}
              onChange={(e) =>
                handleThresholdChange('bloodPressureSys', 'optimal', Number(e.target.value), 0)
              }
              className="bg-white"
              placeholder="Min. BP Systolic"
              min="0"
            />
            <Input
              id="bloodPressureOptimalHigh"
              type="number"
              value={thresholds.bloodPressureSys?.optimal[1] || ''}
              onChange={(e) =>
                handleThresholdChange('bloodPressureSys', 'optimal', Number(e.target.value), 1)
              }
              className="bg-white"
              placeholder="Max. BP Systolic"
              min="0"
            />
          </div>
        </div>

        <div className="w-full px-4 py-6 border hover:border-zinc-300 hover:bg-zinc-50 hover:shadow-sm rounded-md">
          <label htmlFor="avgHeartRateOptimalLow" className="block text-md font-normal">
            {translation('LongTermReportPage.metric_display_blood_pressure_diastolic')}
          </label>
          <p className="text-sm text-gray-500 mt-1">
            {translation('ThresholdForm.blood_pressure_diastolic_subheading')}
          </p>
          <div className="flex space-x-2 mt-8">
            <Input
              id="bloodPressureOptimalLow"
              type="number"
              value={thresholds.bloodPressureDys?.optimal[0] || ''}
              onChange={(e) =>
                handleThresholdChange('bloodPressureDys', 'optimal', Number(e.target.value), 0)
              }
              className="bg-white"
              placeholder="Min. BP Dystolic"
              min="0"
            />
            <Input
              id="bloodPressureOptimalHigh"
              type="number"
              value={thresholds.bloodPressureDys?.optimal[1] || ''}
              onChange={(e) =>
                handleThresholdChange('bloodPressureDys', 'optimal', Number(e.target.value), 1)
              }
              className="bg-white"
              placeholder="Max. BP Dystolic"
              min="0"
            />
          </div>
        </div>
      </div >
      {error &&
        <div className='bg-red-100 px-4 py-4 rounded-sm'>
          <p className="w-full text-red-600">{error}</p>
        </div>
      }
      <div className='w-full text-right'>
        <DialogClose asChild>
          <Button type="submit" variant={'default'} size={'lg'} className="mt-8 w-fit">
            {translation('ThresholdForm.update_thresholds_button')}
          </Button>
        </DialogClose>
      </div>
    </form >
  )
}

export default ThresholdForm
