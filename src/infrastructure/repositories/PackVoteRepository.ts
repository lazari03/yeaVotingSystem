import { PackVote } from '@/domain/entities/PackVote';
import { IPackVoteRepository } from '@/domain/repositories/IPackVoteRepository';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export class PackVoteRepository implements IPackVoteRepository {
  private collectionName = 'packVotes';

  async create(packVote: Omit<PackVote, 'id'>): Promise<PackVote> {
    const docRef = await addDoc(collection(db, this.collectionName), packVote);
    return { id: docRef.id, ...packVote };
  }

  async getByEventId(eventId: string): Promise<PackVote[]> {
    const q = query(collection(db, this.collectionName), where('eventId', '==', eventId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as PackVote));
  }

  async getByJuryAndEvent(juryId: string, eventId: string): Promise<PackVote | null> {
    const q = query(
      collection(db, this.collectionName),
      where('juryId', '==', juryId),
      where('eventId', '==', eventId)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() } as PackVote;
  }
}
