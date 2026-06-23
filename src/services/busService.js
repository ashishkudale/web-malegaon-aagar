import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, orderBy, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const busService = {
  getAllBuses: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'buses'), orderBy('busNumber'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getBusById: async (busId) => {
    const docSnap = await getDoc(doc(db, 'buses', busId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Bus not found');
  },

  addBus: async (busData) => {
    const docRef = await addDoc(collection(db, 'buses'), {
      ...busData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: auth.currentUser?.email || 'system'
    });
    return docRef.id;
  },

  updateBus: async (busId, busData) => {
    await updateDoc(doc(db, 'buses', busId), {
      ...busData,
      updatedAt: Timestamp.now()
    });
  },

  deleteBus: async (busId) => {
    await deleteDoc(doc(db, 'buses', busId));
  }
};
