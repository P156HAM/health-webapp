const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')
const { Timestamp } = require('firebase-admin/firestore')
const { CloudTasksClient } = require('@google-cloud/tasks')
const { addDays, addWeeks, addMonths } = require('date-fns')
const cors = require('cors')({ origin: true })
const axios = require('axios')

// PROD
require('dotenv').config({ path: './.env.prod' })
// DEV
// require('dotenv').config({ path: './.env.dev' })

const db = admin.firestore()
const tasksClient = new CloudTasksClient()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const httpsOptions = {
  cors: true,
  region: 'europe-west3',
}

exports.sendEmailToUser = onRequest(httpsOptions, async (req, res) => {
  cors(req, res, async () => {
    const {
      healthcareProfessional_uid,
      healthcareProfessionalEmail,
      patientUID,
      patientName,
      reminderFrequency,
      reminderTime,
    } = req.body

    try {
      const urlFunctionEndpoint = process.env.GENERATE_AUTH_URL
      const reportUrlResponse = await axios.post(urlFunctionEndpoint, {
        doctorUID: healthcareProfessional_uid,
        patientUID: patientUID,
      })

      const reportUrl = reportUrlResponse.data.reportUrl

      const msg = {
        to: healthcareProfessionalEmail,
        from: 'info@closar.co',
        subject: `Reminder for Patient ${patientName}`,
        html: `
            <p>Hello,</p>
            <p>This is a reminder to check the report for your patient <strong>${patientName}</strong>.</p>
            <p>Click the link below to view the report:</p>
            <p><a href="${reportUrl}">View Patient Report</a></p>
          `,
      }

      await sgMail.send(msg)
      console.log('Reminder email sent.')

      console.log('Reminder time:', reminderTime)

      let nextDate = new Date()
      const [hours] = reminderTime.split(':')
      nextDate.setHours(parseInt(hours, 10), 0, 0, 0)

      if (nextDate <= new Date()) {
        switch (reminderFrequency) {
          case 'daily':
            nextDate = addDays(nextDate, 1)
            break
          case 'weekly':
            nextDate = addWeeks(nextDate, 1)
            break
          case 'bi-weekly':
            nextDate = addWeeks(nextDate, 2)
            break
          case 'tri-weekly':
            nextDate = addWeeks(nextDate, 3)
            break
          default:
            throw new Error('Invalid reminder frequency')
        }
      }

      console.log('Current time:', new Date())
      console.log('Next reminder time calculated:', nextDate)

      const project = process.env.PROJECT
      const queue = process.env.REMINDERS_QUEUE
      const location = process.env.LOCATION
      const url = process.env.SEND_EMAIL_URL

      const taskPayload = {
        healthcareProfessional_uid,
        healthcareProfessionalEmail,
        patientName,
        patientUID,
        reminderFrequency,
        reminderTime,
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
          seconds: Math.floor(nextDate.getTime() / 1000),
        },
      }

      const [response] = await tasksClient.createTask({ parent, task })
      const taskId = response.name

      const reminderRef = db
        .collection('patients')
        .doc(patientUID)
        .collection('reminders')
        .doc(healthcareProfessional_uid)
      await reminderRef.update({
        reminderTime: Timestamp.fromDate(nextDate),
        task_id: taskId,
      })

      res
        .status(200)
        .send({ success: true, message: 'Reminder email sent and next task scheduled.' })
    } catch (error) {
      console.error('Error sending reminder email:', error)
      res.status(500).send('Error sending reminder email.')
    }
  })
})
