const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const { Timestamp } = require('firebase-admin/firestore')
const { CloudTasksClient } = require('@google-cloud/tasks')
const { addDays, subHours, setHours, setMinutes, isBefore, isAfter } = require('date-fns')

// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const db = admin.firestore()
const tasksClient = new CloudTasksClient()

exports.setReminder = functions.region('europe-west3').https.onCall(async (data, context) => {
  const {
    healthcareProfessional_uid,
    healthcareProfessionalEmail,
    patientName,
    patientUID,
    reminderFrequency,
    reminderTime,
    startDay,
  } = data

  if (!context.auth || !context.auth.token.isHealthcareProfessional) {
    return { error: 'Unauthorized' }
  }

  const validFrequencies = ['daily', 'weekly', 'bi-weekly', 'tri-weekly']
  if (!validFrequencies.includes(reminderFrequency)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid reminder frequency')
  }

  if (typeof startDay !== 'number' || !Number.isInteger(startDay) || startDay < 0 || startDay > 6) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid start day. Must be an integer between 0 (Sunday) and 6 (Saturday).'
    )
  }

  const project = process.env.PROJECT
  const queue = process.env.REMINDERS_QUEUE
  const location = process.env.LOCATION
  const url = process.env.SEND_EMAIL_URL

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
      } catch (err) {
        console.error(`Error deleting old task ${taskId}: ${err.message}`)
        throw new functions.https.HttpsError('internal', 'Unable to delete old task', err)
      }
    }
  }

  let currentDate = new Date()
  const [hours, minutes] = reminderTime.split(':').map(Number)
  let reminderDate = setMinutes(setHours(new Date(), hours), minutes)
  reminderDate = subHours(reminderDate, 2) // Adjust for timezone

  if (reminderFrequency === 'daily') {
    if (isBefore(reminderDate, currentDate)) {
      reminderDate = addDays(reminderDate, 1)
    }
  } else {
    const desiredDay = startDay
    const currentDay = currentDate.getDay()

    let daysToAdd = desiredDay - currentDay
    if (daysToAdd < 0) {
      daysToAdd += 7
    }

    if (daysToAdd === 0 && isAfter(currentDate, reminderDate)) {
      switch (reminderFrequency) {
        case 'weekly':
          daysToAdd = 7
          break
        case 'bi-weekly':
          daysToAdd = 14
          break
        case 'tri-weekly':
          daysToAdd = 21
          break
        default:
          throw new Error('Invalid reminder frequency')
      }
    }

    reminderDate = addDays(reminderDate, daysToAdd)
  }

  const adjustedReminderTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`

  const taskPayload = {
    healthcareProfessional_uid,
    healthcareProfessionalEmail,
    patientName,
    patientUID,
    reminderFrequency,
    reminderTime: adjustedReminderTime,
  }

  const parent = tasksClient.queuePath(project, location, queue)
  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      body: Buffer.from(JSON.stringify(taskPayload)).toString('base64'),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    scheduleTime: {
      seconds: Math.floor(reminderDate.getTime() / 1000),
    },
  }

  try {
    const [response] = await tasksClient.createTask({ parent, task })
    const taskId = response.name

    const reminderData = {
      healthcareProfessional_uid,
      patientName: patientName,
      reminderFrequency,
      reminderTime: Timestamp.fromDate(reminderDate),
      task_id: taskId,
      created_at: Timestamp.now(),
    }

    await db
      .collection('patients')
      .doc(patientUID)
      .collection('reminders')
      .doc(healthcareProfessional_uid)
      .set(reminderData)

    return { success: true, taskId: taskId }
  } catch (error) {
    console.error('Error creating task or saving reminder:', error)
    throw new functions.https.HttpsError(
      'internal',
      'Unable to create task or save reminder',
      error
    )
  }
})
