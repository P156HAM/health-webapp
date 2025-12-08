const functions = require('firebase-functions')
const admin = require('./firebaseAdmin')
const firestore = admin.firestore()

exports.getMessages = functions.region('europe-west3').https.onCall(async (data, context) => {
  const { patientUID, healthcareProfessionalUID } = data

  try {
    const messagesSnapshot = await firestore
      .collection('patients')
      .doc(patientUID)
      .collection('messages')
      .where('healthcareProfessional_uid', '==', healthcareProfessionalUID)
      .get()

    if (messagesSnapshot.empty) {
      console.log('No matching messages found')
      return { success: true, messages: [] }
    }

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, messages }
  } catch (error) {
    console.error('Error fetching messages:', error)
    throw new functions.https.HttpsError('internal', 'Unable to fetch messages', error)
  }
})
