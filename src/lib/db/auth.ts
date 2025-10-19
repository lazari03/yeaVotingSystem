// src/lib/db/auth.ts
import { db } from '../../firebaseConfig/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

interface RegisterResult {
  token: string | null;
  message: string;
}

export const register = async (email: string, username: string): Promise<RegisterResult> => {
  const usersCol = collection(db, 'users');

  // Email prüfen
  const emailQ = query(usersCol, where('email', '==', email));
  const emailSnapshot = await getDocs(emailQ);
  if (!emailSnapshot.empty) return { token: null, message: 'Email already in use' };

  // Username prüfen
  const usernameQ = query(usersCol, where('username', '==', username));
  const usernameSnapshot = await getDocs(usernameQ);
  if (!usernameSnapshot.empty) return { token: null, message: 'Username already in use' };

  // User erstellen
  const userRef = doc(usersCol);
  await setDoc(userRef, {
    email,
    username,
    role: 'user',
  });

  return { token: null, message: 'User created' };
};
