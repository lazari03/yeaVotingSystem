import { User } from '@/domain/entities/User';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, where, setDoc } from 'firebase/firestore';

export class UserRepository implements IUserRepository {
  private collectionName = 'users';

  async create(user: User): Promise<User> {
    const docRef = doc(db, this.collectionName, user.id);
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    await setDoc(docRef, userData);
    return userData as User;
  }

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return docSnap.data() as User;
  }

  async getByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, this.collectionName), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as User;
  }

  async getAll(): Promise<User[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => doc.data() as User);
  }

  async getJuryMembers(): Promise<User[]> {
    const q = query(collection(db, this.collectionName), where('role', '==', 'jury'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as User);
  }
}