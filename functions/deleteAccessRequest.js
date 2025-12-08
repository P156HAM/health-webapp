const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const { CloudTasksClient } = require('@google-cloud/tasks')

// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const client = new CloudTasksClient()

exports.deleteDocument = functions.region('europe-west3').https.onRequest(async (req, res) => {
  const { docPath } = req.body

  try {
    await admin.firestore().doc(docPath).delete()
    res.status(200).send('Document deleted successfully.')
  } catch (error) {
    res.status(500).send('Error deleting document: ' + error.message)
  }
})

async function scheduleDeletion(docPath) {
  const project = process.env.PROJECT
  const queue = process.env.ACCESS_REQUEST_QUEUE
  const location = process.env.LOCATION
  const url = process.env.DELETE_FUNCTION_URL
  const payload = JSON.stringify({ docPath })

  const parent = client.queuePath(project, location, queue)
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(payload).toString('base64'),
    },
    scheduleTime: {
      seconds: parseInt(Date.now() / 1000 + 30 * 60),
    },
  }

  try {
    const [response] = await client.createTask({ parent, task })
    console.log(`Created task ${response.name}`)
  } catch (error) {
    console.error('Error creating task:', error)
  }
}

exports.scheduleDeletion = functions
  .region('europe-west3')
  .firestore.document('accessRequest/{docId}')
  .onUpdate(async (change, context) => {
    const docPath = change.after.ref.path
    await scheduleDeletion(docPath)
  })
