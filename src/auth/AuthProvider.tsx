import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase"; // Make sure db is exported from firebase.ts
import AccessNotAuthorised from "../components/containers/AccessNotAuthorised";
import LoadingDefault from "../components/containers/LoadingDefault";

interface HealthcareProfessionalData {
  uid: string;
  firstName: string;
  lastName: string;
  clinicName: string;
  clinicAddress: string;
  clinicCity: string;
  clinicCountry: string;
  clinicID: string;
  email: string;
  approvedTerms: boolean;
  approvedPrivacy: boolean;
  isAdmin: boolean;
  isOnboarded: boolean;
  isHealthcareProfessional: boolean;
  isActive: boolean; // Added isActive field
}

interface AuthContextType {
  user: User | null;
  userData: HealthcareProfessionalData | null;
  isFetching: boolean;
  isActive: boolean | null; // New state for subscription status
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<HealthcareProfessionalData | null>(
    null
  );
  const [isFetching, setFetching] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          // Wait a moment for claims to propagate
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const idTokenResult = await user.getIdTokenResult();
          if (idTokenResult.claims.isHealthcareProfessional) {
            const userDocRef = doc(db, "healthcareProfessionals", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data() as HealthcareProfessionalData;
              setUserData(userData);
              userData.uid = user.uid;
              setIsActive(userData.isActive);
            } else {
              setError("User data does not exist");
            }
          } else {
            await signOut(auth);
            setError("You are not authorised to access the web app");
          }
        } catch (err: any) {
          await signOut(auth);
          setError("You are not authorised to access the web app");
        }
      } else {
        setUserData(null);
      }
      setFetching(false);
    });
    return () => unsubscribe();
  }, []);

  if (isFetching) {
    return <LoadingDefault />;
  }

  if (error) {
    //console.log(error);
    return <AccessNotAuthorised />;
  }

  return (
    <AuthContext.Provider
      value={{ user, userData, isFetching, isActive, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
