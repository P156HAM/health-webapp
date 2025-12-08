const functions = require('firebase-functions')
const CryptoJS = require('crypto-js')
// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const encryptionKey = process.env.ENCRYPTION_KEY
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

exports.decryptAccessRequestID = functions.region('europe-west3').https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { accessRequestId } = req.body
      const bytes = CryptoJS.AES.decrypt(accessRequestId, encryptionKey)
      const decryptedAccessRequestId = bytes.toString(CryptoJS.enc.Utf8)
      res.json({ accessRequestId: decryptedAccessRequestId })
    } catch (error) {
      console.error('Error decrypting access request id:', error)
      res.status(500).send('Error decrypting access request id')
    }
  })
})
