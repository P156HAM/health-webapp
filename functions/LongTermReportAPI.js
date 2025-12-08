const { onRequest } = require('firebase-functions/v2/https')
const admin = require('./firebaseAdmin')
const express = require('express')
const { getSubcollections, getSamples, getSelfReportedSymptoms } = require('./helpers')
const cors = require('cors')

const app = express()

const allowedOrigins = [
  'https://dev.app.vizuhealth.com',
  'https://app.vizuhealth.com',
  'http://localhost',
  'http://localhost:3000',
]

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  optionsSuccessStatus: 200, // legacy browsers.
}

app.use(cors(corsOptions))

const httpsOptions = {
  cors: true,
  minInstances: 1,
  region: 'europe-west3',
}

const authenticate = async (req, res, next) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1]

  if (!idToken) {
    return res.status(401).send('Unauthorized')
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (error) {
    return res.status(401).send('Unauthorized')
  }
}

app.use(authenticate)

app.get('/patientsummary/:patientId', async (req, res) => {
  const patientId = req.params.patientId
  const patientRef = admin.firestore().collection('patients').doc(patientId)

  try {
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).send('Patient not found')
    }

    const patientData = patientDoc.data()
    if (patientData.date_of_birth && patientData.date_of_birth.toDate) {
      patientData.date_of_birth = patientData.date_of_birth.toDate().toISOString().split('T')[0]
    }

    const subcollectionsData = await getSubcollections(patientRef)

    res.send({
      patient: patientData,
      ...subcollectionsData,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/samples/:patientId/:date', async (req, res) => {
  const { patientId, date } = req.params
  const patientRef = admin.firestore().collection('patients').doc(patientId)

  try {
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).send('Patient not found')
    }

    const patientData = patientDoc.data()
    if (patientData.date_of_birth && patientData.date_of_birth.toDate) {
      patientData.date_of_birth = patientData.date_of_birth.toDate().toISOString().split('T')[0]
    }

    const subcollectionsData = await getSamples(patientRef, date)
    const selfReportedSymptoms = await getSelfReportedSymptoms(patientRef, date)
    res.send({
      patient: patientData,
      ...subcollectionsData,
      selfReportedSymptoms,
    })
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})

exports.LongTermReportAPI = onRequest(httpsOptions, app)
