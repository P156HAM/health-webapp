const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const CryptoJS = require('crypto-js')
const rateLimit = require('express-rate-limit')
const express = require('express')
const { quickShareReportData, getSamples, getSelfReportedSymptoms } = require('./helpers')

// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const allowedOrigins = [
  'https://dev.app.vizuhealth.com',
  'https://app.vizuhealth.com',
  'http://localhost',
  'http://localhost:3000',
]

const cors = require('cors')({
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
})

const encryptionKey = process.env.ENCRYPTION_KEY

const app = express()

app.set('trust proxy', true)

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later',
})
app.use(cors)

const verifyToken = async (token) => {
  try {
    const bytes = CryptoJS.AES.decrypt(token, encryptionKey)
    const decryptedAccessRequestId = bytes.toString(CryptoJS.enc.Utf8)
    const docRef = admin.firestore().collection('accessRequest').doc(decryptedAccessRequestId)
    const doc = await docRef.get()

    if (!doc.exists || doc.data().status !== 'approved') {
      throw new Error('Unauthorized access')
    }

    return decryptedAccessRequestId
  } catch (error) {
    console.log('error getting the access request: ', error)
    throw new Error('Invalid or unauthorized token')
  }
}

app.post('/generateAccessRequest', limiter, async (req, res) => {
  const accessRequestRef = admin.firestore().collection('accessRequest').doc()
  const accessRequestId = accessRequestRef.id
  const accessRequestData = {
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'pending',
    uid: accessRequestId,
  }
  try {
    await accessRequestRef.set(accessRequestData)
    const encryptedAccessRequestId = CryptoJS.AES.encrypt(accessRequestId, encryptionKey).toString()
    res.json({ data: { accessRequestId: encryptedAccessRequestId } })
  } catch (error) {
    console.error('Error generating access request:', error)
    res.status(500).send('Error generating access request.')
  }
})

app.get('/patient', async (req, res) => {
  try {
    const patientId = req.query.id
    if (!patientId) {
      return res.status(400).send('Patient ID is required')
    }
    const patientRef = admin.firestore().collection('patients').doc(patientId)
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).send('Patient not found')
    }

    const patientData = patientDoc.data()
    if (patientData.date_of_birth && patientData.date_of_birth.toDate) {
      patientData.date_of_birth = patientData.date_of_birth.toDate().toISOString().split('T')[0]
    }
    res.json({ data: { patientData } })
  } catch (error) {
    console.error('Error fetching patient data:', error)
    res.status(500).send('Error fetching patient data.')
  }
})

app.get('/patientsummary/:patientId', async (req, res) => {
  const token = req.headers.authorization?.split('Bearer ')[1]
  if (!token) return res.status(401).send('Unauthorized')

  try {
    await verifyToken(token)
    const patientId = req.params.patientId
    const patientRef = admin.firestore().collection('patients').doc(patientId)
    const patientDoc = await patientRef.get()

    if (!patientDoc.exists) {
      return res.status(404).send('Patient not found')
    }

    const patientData = patientDoc.data()
    if (patientData.date_of_birth && patientData.date_of_birth.toDate) {
      patientData.date_of_birth = patientData.date_of_birth.toDate().toISOString().split('T')[0]
    }

    const subcollectionsData = await quickShareReportData(patientRef)

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
  try {
    const { patientId, date } = req.params
    const patientRef = admin.firestore().collection('patients').doc(patientId)
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

exports.accessRequestAPI = functions.region('europe-west3').https.onRequest(app)
