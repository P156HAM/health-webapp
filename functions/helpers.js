const { Timestamp } = require('firebase-admin/firestore')

exports.getSubcollections = async (patientRef) => {
  const subcollections = [
    'bodySaturationSummary',
    'bodyMeasurementsSamples',
    'bodyBloodPressureSamples',
    'dailyActiveDurationsSummary',
    'dailyCaloriesSummary',
    'dailyDistanceSummary',
    'dailyHeartRateSummary',
    'dailyOxygenSummary',
    'dailyStressSummary',
    'selfReportedSymptoms',
    'sleepBreathsSummary',
    'sleepHeartRateSummary',
    'sleepSummary',
  ]

  const data = {}

  for (const subcollection of subcollections) {
    const subcollectionRef = patientRef.collection(subcollection)
    const snapshot = await subcollectionRef.get()

    if (subcollection === 'bodyMeasurementsSamples') {
      data[subcollection] = snapshot.docs.map((doc) => {
        const docData = doc.data()
        if (docData && docData.measurements && Array.isArray(docData.measurements)) {
          const totalWeight = docData.measurements.reduce(
            (sum, measurement) => sum + measurement.weight_kg,
            0
          )
          const avgWeight = totalWeight / docData.measurements.length
          return {
            ...docData,
            weight_kg: avgWeight,
          }
        }
        return docData
      })
    } else {
      data[subcollection] = snapshot.docs.map((doc) => doc.data())
    }
  }

  return data
}

const formatDate = (date) => {
  return date.replace(/-/g, '')
}

exports.getSamples = async (patientRef, date) => {
  const subcollections = [
    'sleepSummary',
    'sleepHypnogramSamples',
    'sleepHeartRateSummary',
    'sleepHeartRateSamples',
    'sleepBreathsSummary',
    'sleepSnoringSummary',
    'sleepSaturationSummary',
    'dailyOxygenSummary',
    'dailyDistanceSummary',
    'dailyHeartRateSummary',
    'dailyHeartRateSamples',
    'dailyActiveDurationsSummary',
    'dailyStressSummary',
    'dailyScoresSummary',
    'bodyBloodPressureSamples',
    'bodyMeasurementsSamples',
    'bodyGlucoseSummary',
    'bodyGlucoseSamples',
    'selfReportedSymptoms',
    'preventivePlans',
  ]

  const data = {}
  const formattedDate = formatDate(date)
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 1)
  const endDateString = formatDate(endDate.toISOString().split('T')[0])
  const docId1 = `${formattedDate}_${endDateString}`

  for (const subcollection of subcollections) {
    if (subcollection.startsWith('sleep')) {
      data[subcollection] = await fetchAndCombineSleepData(patientRef, subcollection, date)
    } else {
      const subcollectionRef = patientRef.collection(subcollection)
      const doc = await subcollectionRef.doc(docId1).get()

      if (doc.exists) {
        const docData = doc.data()
        if (
          subcollection === 'bodyMeasurementsSamples' &&
          docData &&
          docData.measurements &&
          Array.isArray(docData.measurements)
        ) {
          const calculateAverage = (key) => {
            const validMeasurements = docData.measurements.filter(
              (measurement) => measurement[key] !== undefined && measurement[key] !== 0
            )
            if (validMeasurements.length === 0) return null
            const total = validMeasurements.reduce((sum, measurement) => sum + measurement[key], 0)
            return total / validMeasurements.length
          }

          const avgWeight = calculateAverage('weight_kg')
          const avgBodyFat = calculateAverage('bodyfat_percentage')
          const avgBoneMass = calculateAverage('bone_mass_g')
          const avgMuscleMass = calculateAverage('muscle_mass_g')
          const avgWaterPercentage = calculateAverage('water_percentage')

          data[subcollection] = {
            ...docData,
            weight_kg: avgWeight,
            bodyfat_percentage: avgBodyFat,
            bone_mass_g: avgBoneMass,
            muscle_mass_g: avgMuscleMass,
            water_percentage: avgWaterPercentage,
            BMI: docData.measurements[0].BMI,
            estimated_fitness_age: docData.measurements[0].estimated_fitness_age,
          }
        } else {
          data[subcollection] = docData
        }
      } else {
        data[subcollection] = null
      }
    }
  }

  return data
}

const fetchAndCombineSleepData = async (patientRef, subcollection, date) => {
  const formattedDate = formatDate(date)
  const startDate = new Date(date)
  const endDate = new Date(date)
  startDate.setDate(startDate.getDate() - 1)
  endDate.setDate(endDate.getDate() + 1)
  const startDateString = formatDate(startDate.toISOString().split('T')[0])
  const endDateString = formatDate(endDate.toISOString().split('T')[0])
  const combinedData = {
    duration_REM_sleep_state_seconds: 0,
    duration_asleep_state_seconds: 0,
    duration_deep_sleep_state_seconds: 0,
    duration_in_bed_seconds: 0,
    duration_light_sleep_state_seconds: 0,
    num_REM_events: 0,
    sleep_efficiency: 0,
    resting_hr_bpm: 0,
    avg_hrv_rmssd: 0,
    avg_breaths_per_min: 0,
    num_snoring_events: 0,
    start_time: 0,
    end_time: 0,
  }

  const docId1 = `${startDateString}_${formattedDate}`
  const docId2 = `${formattedDate}_${formattedDate}`

  let sleepEfficiencyCount = 0
  let avgBreathsPerMinCount = 0

  try {
    const doc1 = await patientRef.collection(subcollection).doc(docId1).get()
    const doc2 = await patientRef.collection(subcollection).doc(docId2).get()

    const docs = [doc1, doc2]
    docs.forEach((doc) => {
      if (doc.exists) {
        const data = doc.data()
        combinedData.duration_REM_sleep_state_seconds += data.duration_REM_sleep_state_seconds || 0
        combinedData.duration_asleep_state_seconds += data.duration_asleep_state_seconds || 0
        combinedData.duration_deep_sleep_state_seconds +=
          data.duration_deep_sleep_state_seconds || 0
        combinedData.duration_in_bed_seconds += data.duration_in_bed_seconds || 0
        combinedData.duration_light_sleep_state_seconds +=
          data.duration_light_sleep_state_seconds || 0
        combinedData.num_REM_events += data.num_REM_events || 0
        combinedData.num_snoring_events += data.num_snoring_events || 0
        combinedData.start_time = data.start_time || 0
        combinedData.end_time = data.end_time || 0
        combinedData.resting_hr_bpm += data.resting_hr_bpm || 0
        combinedData.avg_hrv_rmssd += data.avg_hrv_rmssd || 0
        if (data.sleep_efficiency !== undefined) {
          combinedData.sleep_efficiency += data.sleep_efficiency
          sleepEfficiencyCount++
        }
        if (data.avg_breaths_per_min !== undefined) {
          combinedData.avg_breaths_per_min += data.avg_breaths_per_min
          avgBreathsPerMinCount++
        }
      }
    })

    if (sleepEfficiencyCount > 0) {
      combinedData.sleep_efficiency /= sleepEfficiencyCount
    }
    if (avgBreathsPerMinCount > 0) {
      combinedData.avg_breaths_per_min = Math.round(
        combinedData.avg_breaths_per_min / avgBreathsPerMinCount
      )
    }
  } catch (error) {
    console.error('Error fetching sleep data:', error)
  }

  return combinedData
}

exports.getSelfReportedSymptoms = async (patientRef, date) => {
  let data = []
  const formattedDate = formatDate(date)

  const symptomsSnapshot = await patientRef.collection('selfReportedSymptoms').get()
  symptomsSnapshot.forEach((doc) => {
    const symptom = doc.data()
    const symptomDate =
      symptom.DateAndTime instanceof Timestamp
        ? symptom.DateAndTime.toDate().toISOString().split('T')[0].replace(/-/g, '')
        : new Date(symptom.DateAndTime._seconds * 1000)
            .toISOString()
            .split('T')[0]
            .replace(/-/g, '')

    if (symptomDate === formattedDate) {
      data.push(symptom)
    }
  })

  return data
}

exports.quickShareReportData = async (patientRef) => {
  const subcollections = [
    'bodySaturationSummary',
    'bodyMeasurementsSamples',
    'bodyBloodPressureSamples',
    'dailyActiveDurationsSummary',
    'dailyCaloriesSummary',
    'dailyDistanceSummary',
    'dailyHeartRateSummary',
    'dailyOxygenSummary',
    'dailyStressSummary',
    'selfReportedSymptoms',
    'sleepBreathsSummary',
    'sleepHeartRateSummary',
    'sleepSummary',
  ]

  const data = {}

  const today = new Date()
  const twoYearsAgo = new Date()
  twoYearsAgo.setFullYear(today.getFullYear() - 2)
  const formattedTwoYearsAgo = twoYearsAgo.toISOString()

  for (const subcollection of subcollections) {
    const subcollectionRef = patientRef.collection(subcollection)

    let snapshot
    if (subcollection === 'selfReportedSymptoms') {
      const formattedDate = new Date(formattedTwoYearsAgo)
      snapshot = await subcollectionRef.where('DateAndTime', '>=', formattedDate).get()
    } else {
      snapshot = await subcollectionRef.where('start_time', '>=', formattedTwoYearsAgo).get()
    }

    if (subcollection === 'bodyMeasurementsSamples') {
      data[subcollection] = snapshot.docs.map((doc) => {
        const docData = doc.data()
        if (docData && docData.measurements && Array.isArray(docData.measurements)) {
          const totalWeight = docData.measurements.reduce(
            (sum, measurement) => sum + measurement.weight_kg,
            0
          )
          const avgWeight = totalWeight / docData.measurements.length
          return {
            ...docData,
            weight_kg: avgWeight,
          }
        }
        return docData
      })
    } else {
      data[subcollection] = snapshot.docs.map((doc) => doc.data())
    }
  }

  return data
}
