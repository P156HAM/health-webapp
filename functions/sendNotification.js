const { Expo } = require('expo-server-sdk')
const { onRequest } = require('firebase-functions/v2/https')
const admin = require('./firebaseAdmin')
const express = require('express')
const cors = require('cors')

let expo = new Expo()
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
  optionsSuccessStatus: 200, // For legacy browsers
}

app.use(cors(corsOptions))
app.use(express.json())

const httpsOptions = {
  cors: true,
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

app.post('/', async (req, res) => {
  const { patientUID, messageDocId, healthcareProfessional_name } = req.body

  if (!patientUID || !messageDocId || !healthcareProfessional_name) {
    res
      .status(400)
      .send('Missing patientUID, messageDocId, or healthcareProfessional_name in request body')
    return
  }

  try {
    const patientDoc = await admin.firestore().collection('patients').doc(patientUID).get()

    if (!patientDoc.exists) {
      res.status(404).send('Patient not found')
      return
    }

    const patientData = patientDoc.data()
    const pushTokens = patientData.expoPushToken

    if (!pushTokens || pushTokens.length === 0) {
      res.status(400).send('Patient has no registered push tokens')
      return
    }

    const tokens = Array.isArray(pushTokens) ? pushTokens : [pushTokens]

    let notifications = []
    for (let pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`)
        continue
      }

      notifications.push({
        to: pushToken,
        sound: 'default',
        title: 'You have a new message!',
        body: `New message from ${healthcareProfessional_name}`,
        data: { messageId: messageDocId },
      })
    }

    if (notifications.length === 0) {
      res.status(400).send('No valid Expo push tokens provided')
      return
    }

    // Send notifications
    let tickets = []
    let chunks = expo.chunkPushNotifications(notifications)
    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
      console.log(ticketChunk)
      tickets.push(...ticketChunk)
    }

    res.status(200).send({ tickets })
  } catch (error) {
    console.error('Error sending notifications:', error)
    res.status(500).send('Error sending notifications')
  }
})

exports.sendNotification = onRequest(httpsOptions, app)
