import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/firebase' // Make sure db is exported from firebase.ts
import AccessNotAuthorised from '../components/containers/AccessNotAuthorised'
import LoadingDefault from '../components/containers/LoadingDefault'
import { isMockMode } from '../mocks/config'
import { getMockUser, getMockUserData } from '../mocks/services'

interface HealthcareProfessionalData {
  uid: string
  firstName: string
  lastName: string
  clinicName: string
  clinicAddress: string
  clinicCity: string
  clinicCountry: string
  clinicID: string
  email: string
  approvedTerms: boolean
  approvedPrivacy: boolean
  isAdmin: boolean
  isOnboarded: boolean
  isHealthcareProfessional: boolean
  isActive: boolean // Added isActive field
}

interface AuthContextType {
  user: User | null
  userData: HealthcareProfessionalData | null
  isFetching: boolean
  isActive: boolean | null // New state for subscription status
  error: string | null
  logout?: () => void // Add logout function for mock mode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // In mock mode, initialize state based on localStorage immediately
  const getInitialMockState = () => {
    if (isMockMode) {
      const mockAuthState = localStorage.getItem('mockAuthState')
      if (mockAuthState === 'loggedIn') {
        const mockUser = getMockUser()
        const mockUserData = getMockUserData()
        return {
          user: mockUser,
          userData: mockUserData as any,
          isActive: mockUserData.isActive,
          isFetching: false,
        }
      }
      return {
        user: null,
        userData: null,
        isActive: true,
        isFetching: false,
      }
    }
    return {
      user: null,
      userData: null,
      isActive: true,
      isFetching: true,
    }
  }

  const initialState = getInitialMockState()
  const [user, setUser] = useState<User | null>(initialState.user)
  const [userData, setUserData] = useState<HealthcareProfessionalData | null>(initialState.userData)
  const [isFetching, setFetching] = useState(initialState.isFetching)
  const [isActive, setIsActive] = useState(initialState.isActive)
  const [error, setError] = useState<string | null>(null)

  // Expose logout function for mock mode
  const handleMockLogout = () => {
    if (isMockMode) {
      setUser(null)
      setUserData(null)
      setIsActive(true)
      setError(null)
      localStorage.removeItem('loginTime')
      localStorage.removeItem('mockAuthState')
    }
  }

  useEffect(() => {
    if (isMockMode) {
      // Function to check and update mock auth state
      const checkMockAuth = () => {
        const mockAuthState = localStorage.getItem('mockAuthState')
        if (mockAuthState === 'loggedIn') {
          const mockUser = getMockUser()
          const mockUserData = getMockUserData()
          setUser(mockUser)
          setUserData(mockUserData as any)
          setIsActive(mockUserData.isActive)
          setError(null)
        } else {
          setUser(null)
          setUserData(null)
        }
        setFetching(false)
      }

      // Check immediately
      checkMockAuth()

      // Listen for custom event when login happens (same tab)
      const handleMockAuthChange = () => {
        checkMockAuth()
      }

      // Listen for storage changes (when login happens in different tab)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'mockAuthState') {
          checkMockAuth()
        }
      }

      window.addEventListener('mockAuthStateChanged', handleMockAuthChange)
      window.addEventListener('storage', handleStorageChange)

      return () => {
        window.removeEventListener('mockAuthStateChanged', handleMockAuthChange)
        window.removeEventListener('storage', handleStorageChange)
      }
    }

    // Only proceed with Firebase auth if not in mock mode
    if (!auth) {
      setFetching(false)
      setError('Firebase not initialized')
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        try {
          // Wait a moment for claims to propagate
          await new Promise((resolve) => setTimeout(resolve, 5000))

          const idTokenResult = await user.getIdTokenResult()
          if (idTokenResult.claims.isHealthcareProfessional) {
            const userDocRef = doc(db, 'healthcareProfessionals', user.uid)
            const userDocSnap = await getDoc(userDocRef)
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as HealthcareProfessionalData
              setUserData(userData)
              userData.uid = user.uid
              setIsActive(userData.isActive)
            } else {
              setError('User data does not exist')
            }
          } else {
            await signOut(auth)
            setError('You are not authorised to access the web app')
          }
        } catch (err: any) {
          await signOut(auth)
          setError('You are not authorised to access the web app')
        }
      } else {
        setUserData(null)
      }
      setFetching(false)
    })
    return () => unsubscribe()
  }, [])

  if (isFetching) {
    return <LoadingDefault />
  }

  if (error) {
    //console.log(error);
    return <AccessNotAuthorised />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isFetching,
        isActive,
        error,
        logout: isMockMode ? handleMockLogout : undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
