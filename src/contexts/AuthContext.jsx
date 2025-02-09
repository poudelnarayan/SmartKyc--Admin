import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is admin
        const userDoc = await getDoc(doc(db, "admins", user.uid));
        const isUserAdmin = userDoc.exists() && userDoc.data().isAdmin === true;

        if (!isUserAdmin) {
          // If not admin, sign out immediately
          await signOut(auth);
          setUser(null);
          setIsAdmin(false);
        } else {
          setUser(user);
          setIsAdmin(true);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      // First check if the user is an admin before logging in
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(doc(db, "admins", userCredential.user.uid));

      if (!userDoc.exists() || !userDoc.data().isAdmin) {
        // If not admin, sign out immediately and throw error
        await signOut(auth);
        throw new Error("Access denied. Only admin accounts are allowed.");
      }

      return userCredential;
    } catch (error) {
      if (error.message === "Access denied. Only admin accounts are allowed.") {
        throw error;
      }
      // Handle other Firebase auth errors
      throw new Error("Invalid email or password");
    }
  };

  const createAdmin = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Create admin document
      await setDoc(doc(db, "admins", userCredential.user.uid), {
        email,
        isAdmin: true,
        createdAt: new Date().toISOString(),
      });

      toast.success("Admin account created successfully!");
      return userCredential;
    } catch (error) {
      console.error("Create Admin Error:", error);
      throw error;
    }
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    isAdmin,
    login,
    logout,
    createAdmin,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading ? children : <LoadingScreen />}
    </AuthContext.Provider>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading SmartKYC...</p>
      </div>
    </div>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
