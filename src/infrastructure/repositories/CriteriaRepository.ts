import { Criteria } from '@/domain/entities/Criteria';
import { ICriteriaRepository } from '@/domain/repositories/ICriteriaRepository';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';

export class CriteriaRepository implements ICriteriaRepository {
  private collectionName = 'criteria';

  async create(criteria: Omit<Criteria, 'id'>): Promise<Criteria> {
    const docRef = await addDoc(collection(db, this.collectionName), criteria);
    return { id: docRef.id, ...criteria };
  }

  async getById(id: string): Promise<Criteria | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Criteria;
  }

  async getByEventId(eventId: string): Promise<Criteria[]> {
    const q = query(collection(db, this.collectionName), where('eventId', '==', eventId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Criteria));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async deleteByEventId(eventId: string): Promise<void> {
    const criteria = await this.getByEventId(eventId);
    for (const c of criteria) {
      await this.delete(c.id);
    }
  }
}