import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

export const stopService = {
  // Get all stops
  getAllStops: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'stops'), orderBy('stopNameEnglish'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get stop by ID
  getStopById: async (stopId) => {
    const docSnap = await getDoc(doc(db, 'stops', stopId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Stop not found');
  },

  // Add stop
  addStop: async (stopData) => {
    const docRef = await addDoc(collection(db, 'stops'), {
      ...stopData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: auth.currentUser?.email || 'system'
    });
    return docRef.id;
  },

  // Update stop
  updateStop: async (stopId, stopData) => {
    await updateDoc(doc(db, 'stops', stopId), {
      ...stopData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete stop
  deleteStop: async (stopId) => {
    await deleteDoc(doc(db, 'stops', stopId));
  },

  // Get active stops
  getActiveStops: async () => {
    const querySnapshot = await getDocs(
      query(
        collection(db, 'stops'),
        where('isActive', '==', true),
        orderBy('stopNameEnglish')
      )
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};
