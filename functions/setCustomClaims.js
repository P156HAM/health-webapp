const functions = require('firebase-functions');
const admin = require('./firebaseAdmin');

exports.setCustomClaims = functions.region('europe-west3').https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Request had invalid credentials.');
    }

    const { uid, claims } = data;

    // Ensure claims is an array of objects
    if (!Array.isArray(claims) || !claims.every(claim => typeof claim === 'object')) {
        throw new functions.https.HttpsError('invalid-argument', 'Claims must be an array of objects.');
    }

    try {
        const customClaims = claims.reduce((acc, claim) => {
            return { ...acc, ...claim };
        }, {});

        await admin.auth().setCustomUserClaims(uid, customClaims);
        return { message: `Custom claim(s) set for user ${uid}` };
    } catch (error) {
        throw new functions.https.HttpsError('unknown', `Error setting custom claims: ${error.message}`);
    }
});
