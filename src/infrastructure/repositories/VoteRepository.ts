import { Vote } from '@/domain/entities/Vote';
import { IVoteRepository } from '@/domain/repositories/IVoteRepository';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, query, where, onSnapshot, updateDoc } from 'firebase/firestore';

export class VoteRepository implements IVoteRepository {
  private collectionName = 'votes';

  async create(vote: Omit<Vote, 'id'>): Promise<Vote> {
    const docRef = await addDoc(collection(db, this.collectionName), vote);
    return { id: docRef.id, ...vote };
  }

  async getById(id: string): Promise<Vote | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Vote;
  }

  async getByEventId(eventId: string): Promise<Vote[]> {
    const q = query(collection(db, this.collectionName), where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
  }

  async getByJuryAndTeam(juryId: string, teamId: string): Promise<Vote | null> {
    const q = query(
      collection(db, this.collectionName),
      where('juryId', '==', juryId),
      where('teamId', '==', teamId)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return querySnapshot.docs[0].data() as Vote;
  }

  async getActiveVotesByJuryAndTeam(juryId: string, teamId: string): Promise<Vote | null> {
    const votes = await this.getByJuryAndTeam(juryId, teamId);
    if (!votes) return null;
    return votes.isActive ? votes : null;
  }

  async update(vote: Vote): Promise<Vote> {
    const { id, ...data } = vote;
    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, data);
    return vote;
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  subscribeToEventVotes(eventId: string, onUpdate: (votes: Vote[]) => void): () => void {
    const q = query(collection(db, this.collectionName), where('eventId', '==', eventId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const votes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Vote));
      onUpdate(votes);
    });
    return unsubscribe;
  }
}