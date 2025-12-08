import React, { useState, useRef, useEffect } from 'react'
import { Checkbox } from '../../ui/checkbox'
import { Button } from '../../ui/button'
import { useToast } from '../../ui/use-toast'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'src/components/ui/accordion'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/preventive-plan-dialog'
import { useAuth } from '../../../auth/AuthProvider'

interface AnomalyCheckboxFormProps {
  setTriggerDialog: (trigger: () => void) => void
  userUid: string
}

type MetricKey =
  | 'dailyHeartRateSummary'
  | 'sleepSummary'
  | 'sleepHeartRateSummary'
  | 'sleepBreathsSummary'
  | 'dailyOxygenSummary'
  | 'deepSleepSummary'
  | 'sleepSaturationSummary'
  | 'dailyDistanceSummary'
  | 'dailyStressSummary'
  | 'stressLevel'

const metricLabels: Record<MetricKey, string> = {
  dailyHeartRateSummary: 'Heart Rate (Simple Moving Average)',
  sleepSummary: 'Sleep Duration (Simple Moving Average)',
  sleepHeartRateSummary: 'Daily Sleep Heart (Simple Moving Average)',
  sleepBreathsSummary: 'Daily Sleep Breath (Simple Moving Average)',
  dailyOxygenSummary: 'Daily Oxygen (Simple Moving Average)',
  deepSleepSummary: 'Daily Deep Sleep (Simple Moving Average)',
  sleepSaturationSummary: 'Daily Saturation (Simple Moving Average)',
  dailyDistanceSummary: 'Daily Distance (Simple Moving Average)',
  dailyStressSummary: 'Daily Stress (Simple Moving Average)',
  stressLevel: 'Daily Stress Level (Simple Moving Average)',
}

const displayNames: Record<MetricKey, string> = {
  dailyHeartRateSummary: 'Heart Rate (SMA)',
  sleepSummary: 'Sleep Duration (SMA)',
  sleepHeartRateSummary: 'Sleep Heart Rate (SMA)',
  sleepBreathsSummary: 'Sleep Breath (SMA)',
  dailyOxygenSummary: 'Oxygen Level (SMA)',
  deepSleepSummary: 'Deep Sleep (SMA)',
  sleepSaturationSummary: 'Saturation Level (SMA)',
  dailyDistanceSummary: 'Distance (SMA)',
  dailyStressSummary: 'Stress (SMA)',
  stressLevel: 'Stress Level (SMA)',
}

interface AnomalyData {
  start_time: string
  end_time: string
}

interface AnomalyDataWithName extends AnomalyData {
  displayName: string
}

interface AnomalyResult {
  status: 'no_data' | 'no_anomalies' | 'anomalies_detected'
  anomalies: AnomalyDataWithName[]
}

type ResultType = Record<MetricKey, AnomalyResult>

interface StoredData {
  selectedMetrics: MetricKey[]
  results: ResultType
}

const AnomalyCheckboxForm = ({ setTriggerDialog, userUid }: AnomalyCheckboxFormProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { user } = useAuth()
  const [result, setResult] = useState<ResultType>({
    dailyHeartRateSummary: { status: 'no_data', anomalies: [] },
    sleepSummary: { status: 'no_data', anomalies: [] },
    sleepHeartRateSummary: { status: 'no_data', anomalies: [] },
    sleepBreathsSummary: { status: 'no_data', anomalies: [] },
    dailyOxygenSummary: { status: 'no_data', anomalies: [] },
    deepSleepSummary: { status: 'no_data', anomalies: [] },
    sleepSaturationSummary: { status: 'no_data', anomalies: [] },
    dailyDistanceSummary: { status: 'no_data', anomalies: [] },
    dailyStressSummary: { status: 'no_data', anomalies: [] },
    stressLevel: { status: 'no_data', anomalies: [] },
  })
  const formDialogRef = useRef<HTMLButtonElement>(null)
  const resultDialogRef = useRef<HTMLButtonElement>(null)
  const BASE_URL = process.env.REACT_APP_PYTHON_SERVICES_URL
  const { toast } = useToast()

  useEffect(() => {
    const storedData = sessionStorage.getItem('anomalyResults')
    if (storedData) {
      const parsedData: StoredData[] = JSON.parse(storedData)
    }
  }, [])

  useEffect(() => {
    setTriggerDialog(() => () => formDialogRef.current?.click())
  }, [setTriggerDialog])

  const handleCheckboxChange = (metric: MetricKey, isChecked: boolean) => {
    setSelectedMetrics((prevSelected) =>
      isChecked ? [...prevSelected, metric] : prevSelected.filter((m) => m !== metric)
    )
  }

  const handleSubmit = async () => {
    formDialogRef.current?.click()

    const storedDataKey = `anomalyResults_${userUid}`
    const storedData: StoredData[] = JSON.parse(localStorage.getItem(storedDataKey) || '[]')

    const metricsToFetch: MetricKey[] = []
    const cachedResults: ResultType = { ...result }

    selectedMetrics.forEach((metric) => {
      const matchingData = storedData.find((data) => data.selectedMetrics.includes(metric))

      if (matchingData) {
        cachedResults[metric] = matchingData.results[metric]
      } else {
        metricsToFetch.push(metric)
      }
    })

    if (metricsToFetch.length === 0) {
      setResult(cachedResults)
      resultDialogRef.current?.click()
      return
    }

    try {
      setIsLoading(true)

      const fetchedResults: ResultType = { ...cachedResults }
      const idToken = user && (await user.getIdToken(true))
      for (const metric of metricsToFetch) {
        const response = await fetch(`${BASE_URL}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
          },
          body: JSON.stringify({ subcollection_name: metric, patient_uid: userUid }),
        })

        let fetchedResult = await response.json()

        if (typeof fetchedResult === 'string') {
          fetchedResult = JSON.parse(fetchedResult)
        }

        if (typeof fetchedResult.anomalies === 'string') {
          const anomalies = JSON.parse(fetchedResult.anomalies)
          fetchedResults[metric] = {
            status: fetchedResult.status,
            anomalies: anomalies.map((item: AnomalyData) => ({
              ...item,
              displayName: displayNames[metric],
            })),
          }
        } else {
          fetchedResults[metric] = {
            status: fetchedResult.status,
            anomalies: fetchedResult.anomalies.map((item: AnomalyData) => ({
              ...item,
              displayName: displayNames[metric],
            })),
          }
        }
      }

      const newStoredData: StoredData = {
        selectedMetrics: [...selectedMetrics],
        results: fetchedResults,
      }

      localStorage.setItem(storedDataKey, JSON.stringify([...storedData, newStoredData]))
      setResult(fetchedResults)
      resultDialogRef.current?.click()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isLoading) {
      toast({
        className: 'border shadow-md',
        title: 'Anomaly Detection In Progress',
        description:
          'The operation might take a while. The results will be delivered when calculations are completed.',
      })
    }
  }, [isLoading, toast])

  return (
    <>
      <Dialog>
        <DialogTrigger ref={formDialogRef} style={{ display: 'none' }} />
        <DialogContent className="gap-12 max-h-[90vh] lg:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium text-left mb-1">
              Anomaly Detection
            </DialogTitle>
            <DialogDescription className="text-black text-md text-left mt-2 text-black/65">
              Select the biomarkers to run anomaly detection on and start by clicking button at the
              bottom.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 h-full overflow-y-auto pb-2">
            {(Object.keys(metricLabels) as MetricKey[]).map((metric, index) => (
              <div
                className="relative px-4 py-4 border rounded-md hover:shadow-sm hover:border-zinc-300 hover:bg-zinc-50 cursor-pointer"
                key={index}
                onClick={() => handleCheckboxChange(metric, !selectedMetrics.includes(metric))}
              >
                <div className="flex flex-col justify-between h-full">
                  {/* Checkbox at the top left corner */}
                  <div className="absolute top-4 left-4">
                    <Checkbox
                      checked={selectedMetrics.includes(metric)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange(metric, checked as boolean)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5 bg-white border-black data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white"
                    />
                  </div>

                  {/* Texts at the bottom */}
                  <div className="mt-12">
                    <span className="flex flex-col">
                      <p className="text-md font-normal text-black">{metricLabels[metric]}</p>
                    </span>
                    <span className="flex flex-col mt-1">
                      <p className="text-sm font-normal text-black/55">
                        Short descriptional text about what this anomaly detection is calculating,
                        how it is done, and so on.
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full flex justify-end">
            <Button
              variant="default"
              size="lg"
              className={`w-full md:w-fit ${selectedMetrics.length <= 0 ? 'inactive' : ''}`}
              onClick={selectedMetrics.length > 0 ? handleSubmit : undefined}
              disabled={selectedMetrics.length <= 0}
            >
              Run Anomaly Detection
            </Button>
          </div>
        </DialogContent>
        <DialogClose onClick={() => setTriggerDialog(() => () => formDialogRef.current?.click())} />
      </Dialog>

      <Dialog>
        <DialogTrigger ref={resultDialogRef} style={{ display: 'none' }} />
        <DialogContent className="gap-12 max-h-[90vh] lg:max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-medium text-left mb-1">
              Result of Anomaly Detection
            </DialogTitle>
            <DialogDescription className="text-black text-md text-left mt-2 text-black/65">
              Displaying result of the anomaly detection below.
            </DialogDescription>
            <DialogDescription className="text-black text-md text-left">
              <div className="mt-8">
                {result && Object.values(result).some((data) => data.status !== 'no_data') ? (
                  <Accordion
                    type="multiple"
                    defaultValue={Object.entries(result)
                      .filter(([metric]) => selectedMetrics.includes(metric as MetricKey))
                      .map(([metric]) => metric)}
                    className="no-underline"
                  >
                    {Object.entries(result)
                      .filter(([metric]) => selectedMetrics.includes(metric as MetricKey))
                      .map(([metric, data]) => (
                        <AccordionItem
                          key={metric}
                          value={metric}
                          className="no-underline border rounded-md px-4 mb-4 hover:shadow-sm hover:border-zinc-300"
                        >
                          <AccordionTrigger className="text-lg font-normal hover:no-underline">
                            {displayNames[metric as MetricKey]}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid grid-cols-3 gap-3">
                              {data.status === 'no_data' ? (
                                <p className="text-left col-span-3">
                                  No data available for {displayNames[metric as MetricKey]}.
                                </p>
                              ) : data.status === 'no_anomalies' && displayNames !== undefined ? (
                                <p className="text-left col-span-3">
                                  No anomalies detected for {displayNames[metric as MetricKey]}.
                                </p>
                              ) : data.anomalies && data.anomalies.length > 0 ? ( // Added check here
                                data.anomalies.map((item: AnomalyData, index: number) => (
                                  <div
                                    key={index}
                                    className="px-3 py-3 border rounded-md hover:shadow-sm border-zinc-300 bg-zinc-100"
                                  >
                                    <p>
                                      From {new Date(item.start_time).toLocaleString().slice(0, 10)}{' '}
                                      to {new Date(item.end_time).toLocaleString().slice(0, 10)}
                                    </p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center col-span-3">
                                  No anomalies data available.
                                </p>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                  </Accordion>
                ) : (
                  <p>No anomalies detected.</p>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default AnomalyCheckboxForm
