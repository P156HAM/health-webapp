const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const { Timestamp } = require('firebase-admin/firestore')
const firestore = admin.firestore()

exports.sendMessage = functions.region('europe-west3').https.onCall(async (data, context) => {
  const { message, patientUID, healthcareProfessional } = data

  const messageData = {
    message: message,
    timestamp: Timestamp.fromDate(new Date()),
    healthcareProfessional_uid: healthcareProfessional.uid,
    healthcareProfessional_name: `${healthcareProfessional.firstName} ${healthcareProfessional.lastName}`,
    clinic_name: healthcareProfessional.clinicName,
  }

  try {
    const messageDocRef = firestore
      .collection('patients')
      .doc(patientUID)
      .collection('messages')
      .doc()

    await messageDocRef.set(messageData)

    console.log('Message saved to Firestore')
    return { messageDocId: messageDocRef.id }
  } catch (error) {
    console.error('Error saving message:', error)
    throw new functions.https.HttpsError('internal', 'Unable to save message', error)
  }
})
