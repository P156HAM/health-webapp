const { onRequest } = require('firebase-functions/v2/https')
const admin = require('./firebaseAdmin')
const cors = require('cors')({ origin: true })

const httpsOptions = {
  cors: true,
  region: 'europe-west3',
}

async function createDoctorAuthToken(doctorUID) {
  try {
    const additionalClaims = {
      role: 'isHealthcareProfessional',
    }

    const customToken = await admin.auth().createCustomToken(doctorUID, additionalClaims)
    return customToken
  } catch (error) {
    console.error('Error creating custom token:', error)
    throw new Error('Unable to create custom token.')
  }
}

exports.generateAuthURL = onRequest(httpsOptions, async (req, res) => {
  cors(req, res, async () => {
    const { doctorUID, patientUID } = req.body

    if (!doctorUID || !patientUID) {
      return res.status(400).send('doctorUID and patientUID are required.')
    }

    try {
      const token = await createDoctorAuthToken(doctorUID)

      const reportUrl = `${process.env.BASE_URL}/${patientUID}?authToken=${token}`
      res.status(200).send({ reportUrl })
    } catch (error) {
      console.error('Error generating report URL:', error)
      res.status(500).send('Unable to generate report URL.')
    }
  })
})
