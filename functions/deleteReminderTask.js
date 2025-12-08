const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const { CloudTasksClient } = require('@google-cloud/tasks')

// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const db = admin.firestore()
const tasksClient = new CloudTasksClient()

exports.deleteReminderTask = functions
  .region('europe-west3')
  .https.onCall(async (data, context) => {
    const { healthcareProfessional_uid, patientUID } = data

    if (!context.auth || !context.auth.token.isHealthcareProfessional) {
      return { error: 'Unauthorized' }
    }

    const existingReminder = await db
      .collection('patients')
      .doc(patientUID)
      .collection('reminders')
      .doc(healthcareProfessional_uid)
      .get()

    if (existingReminder.exists) {
      const taskId = existingReminder.data().task_id
      if (taskId) {
        try {
          await tasksClient.deleteTask({ name: taskId })
          console.log(`Deleted old task with ID: ${taskId}`)
          await db
            .collection('patients')
            .doc(patientUID)
            .collection('reminders')
            .doc(healthcareProfessional_uid)
            .delete()

          return { success: true, message: 'Reminder and task deleted successfully' }
        } catch (err) {
          console.error(`Error deleting task with ID ${taskId}: ${err.message}`)
          throw new functions.https.HttpsError('internal', 'Unable to delete task or reminder', err)
        }
      } else {
        throw new functions.https.HttpsError('not-found', 'Task ID not found for this reminder')
      }
    } else {
      throw new functions.https.HttpsError(
        'not-found',
        'No reminder found for this healthcare professional in Firestore'
      )
    }
  })
