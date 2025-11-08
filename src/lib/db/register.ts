// src/lib/db/register.ts
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import app, { db } from "../../firebaseConfig/firebase";
import { Role } from "@/utils/Roles";

const auth = getAuth(app);

/**
 * Register a new user
 * @param email - User email
 * @param password - User password
 * @param fullName - User's full name
 * @param role - User role (Admin, Jury, User, Guest)
 * @returns Object with success status and optional error message
 */
export const register = async (
  email: string,
  password: string,
  fullName: string,
  role: Role
): Promise<{ success: boolean; uid?: string; error?: string }> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: fullName,
    });

    // Store additional user data in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email,
      fullName: fullName,
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, uid: user.uid };
  } catch (error: any) {
    console.error("Registration failed:", error);
    
    // Handle specific Firebase errors
    let errorMessage = "Registration failed";
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email is already registered";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Invalid email address";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password is too weak";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { success: false, error: errorMessage };
  }
};
