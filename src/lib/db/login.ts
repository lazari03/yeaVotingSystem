// src/lib/db/login.ts
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import app from "../../firebaseConfig/firebase";

const auth = getAuth(app);

/**
 * Login function
 * @param email - User email
 * @param password - User password
 * @returns JWT token if login successful, otherwise null
 */
export const login = async (email: string, password: string): Promise<string | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return token;
  } catch (error) {
    console.error("Login failed:", error);
    return null;
  }
};
