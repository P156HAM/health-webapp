const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");

function generateRandomPassword(length) {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

exports.createHealthcareProfessional = functions
  .region("europe-west3")
  .https.onCall(async (data, context) => {
    functions.logger.info("Starting createHealthcareProfessional function", {
      structuredData: true,
    });

    if (!context.auth || !context.auth.token.isAdmin) {
      return { error: "Unauthorized" };
    }

    const {
      email,
      firstName,
      lastName,
      isAdmin,
      clinicName,
      clinicAddress,
      clinicCity,
      clinicCountry,
      clinicID,
      paymentCheck,
    } = data;

    try {
      const password = generateRandomPassword(
        Math.floor(Math.random() * 6) + 15
      );

      // Create the user
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
      });

      // Set custom claims
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        isAdmin: isAdmin,
        isHealthcareProfessional: true,
      });

      // Create the healthcare professional document
      await admin
        .firestore()
        .doc(`healthcareProfessionals/${userRecord.uid}`)
        .set({
          createdAt: userRecord.metadata.creationTime,
          firstName: firstName,
          lastName: lastName,
          clinicName: clinicName,
          clinicAddress: clinicAddress,
          clinicCity: clinicCity,
          clinicCountry: clinicCountry,
          clinicID: clinicID,
          email: email,
          approvedTerms: true,
          approvedPrivacy: true,
          isOnboarded: false,
          isActive: paymentCheck ? true : false,
          isAdmin: isAdmin,
          isHealthcareProfessional: true,
        });

      // Fetch the clinic document and update the healthcareProfessionals array
      if (clinicID) {
        const clinicDocRef = admin.firestore().doc(`clinics/${clinicID}`);
        const clinicDoc = await clinicDocRef.get();

        if (!clinicDoc.exists) {
          throw new functions.https.HttpsError("not-found", "Clinic not found");
        }

        const healthcareProfessionals =
          clinicDoc.data().healthcareProfessionals || [];
        healthcareProfessionals.push(userRecord.uid);

        await clinicDocRef.update({
          healthcareProfessionals: healthcareProfessionals,
        });
      }
      return { message: "Account created successfully", email: email };
    } catch (error) {
      return { error: `Error creating user: ${error.message}` };
    }
  });
