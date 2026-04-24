import { Team } from '@/domain/entities/Team';
import { ITeamRepository } from '@/domain/repositories/ITeamRepository';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';

export class TeamRepository implements ITeamRepository {
  private collectionName = 'teams';

  async create(team: Omit<Team, 'id'>): Promise<Team> {
    const docRef = await addDoc(collection(db, this.collectionName), team);
    return { id: docRef.id, ...team };
  }

  async getById(id: string): Promise<Team | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Team;
  }

  async getByEventId(eventId: string): Promise<Team[]> {
    const q = query(collection(db, this.collectionName), where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}