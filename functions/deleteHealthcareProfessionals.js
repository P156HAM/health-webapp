const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')

exports.deleteHealthcareProfessionals = functions
  .region('europe-west3')
  .https.onCall(async (data, context) => {
    const uid = data.uid

    if (!context.auth || !context.auth.token.isAdmin) {
      return { error: 'Unauthorized' }
    }

    if (!uid) {
      throw new functions.https.HttpsError('invalid-argument', 'No UID provided')
    }

    try {
      await admin.auth().deleteUser(uid)
      return { message: `Successfully deleted user with UID: ${uid}` }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw new functions.https.HttpsError('internal', 'Error deleting user', error.message)
    }
  })
