import { Log } from '@/domain/entities/Log';
import { ILogRepository } from '@/domain/repositories/ILogRepository';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, where, orderBy, limit } from 'firebase/firestore';

export class LogRepository implements ILogRepository {
  private collectionName = 'logs';

  async create(log: Omit<Log, 'id'>): Promise<Log> {
    const docRef = await addDoc(collection(db, this.collectionName), log);
    return { id: docRef.id, ...log };
  }

  async getByVoteId(voteId: string): Promise<Log[]> {
    const q = query(
      collection(db, this.collectionName),
      where('voteId', '==', voteId),
      orderBy('timestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
  }

  async getAll(): Promise<Log[]> {
    const q = query(
      collection(db, this.collectionName),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Log));
  }
}