import { Event } from '@/domain/entities/Event';
import { IEventRepository } from '@/domain/repositories/IEventRepository';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, addDoc, deleteDoc } from 'firebase/firestore';

export class EventRepository implements IEventRepository {
  private collectionName = 'events';

  async create(event: Omit<Event, 'id'>): Promise<Event> {
    const docRef = await addDoc(collection(db, this.collectionName), event);
    return { id: docRef.id, ...event };
  }

  async getById(id: string): Promise<Event | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Event;
  }

  async getAll(): Promise<Event[]> {
    const querySnapshot = await getDocs(collection(db, this.collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event));
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}