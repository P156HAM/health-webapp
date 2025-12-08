const dotenv = require('dotenv')
const path = require('path')
const admin = require('firebase-admin')

const environment = process.env.NODE_ENV
//console.log('environment', environment)
const envPath = path.resolve(__dirname, `./.env.${environment}`)
dotenv.config({ path: envPath })

const projectId = process.env.PROJECT_ID
//console.log('projectId', projectId)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: projectId,
  })
}

module.exports = admin
