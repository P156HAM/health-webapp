import { initializeApp, FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions'

const isMockMode = process.env.REACT_APP_USE_MOCKS === 'true'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY || 'mock-api-key',
  authDomain: process.env.REACT_APP_AUTH_DOMAIN || 'mock-auth-domain',
  projectId: process.env.REACT_APP_PROJECT_ID || 'mock-project-id',
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET || 'mock-storage-bucket',
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID || 'mock-sender-id',
  appId: process.env.REACT_APP_APP_ID || 'mock-app-id',
}

// Initialize Firebase only if not in mock mode
let app: FirebaseApp
let auth: Auth
let db: Firestore
let functions: Functions

if (!isMockMode) {
  // Initialize Firebase with actual config
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app, 'europe-west3')

  // Connect to Functions emulator when running locally
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    connectFunctionsEmulator(functions, 'localhost', 5001)
    //connectAuthEmulator(auth, "http://localhost:9099");
  }
} else {
  // In mock mode, initialize with dummy config to prevent errors
  // These services won't be used since all components check isMockMode first
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  functions = getFunctions(app, 'europe-west3')
}

// Export services
export { auth, db, functions }
