import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';

const CONNECTIONS_COLLECTION = 'connections';

export const connectionService = {
  // Get all connections
  getAllConnections: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, CONNECTIONS_COLLECTION));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  },

  // Get connection by ID
  getConnectionById: async (connectionId) => {
    try {
      const docSnap = await getDoc(doc(db, CONNECTIONS_COLLECTION, connectionId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      throw new Error('Connection not found');
    } catch (error) {
      console.error('Error getting connection:', error);
      throw error;
    }
  },

  // Add new connection
  addConnection: async (connectionData) => {
    try {
      // Check if connection already exists
      const existing = await connectionService.checkConnectionExists(
        connectionData.fromStopId,
        connectionData.toStopId
      );

      if (existing) {
        throw new Error('Connection already exists');
      }

      const docRef = await addDoc(collection(db, CONNECTIONS_COLLECTION), {
        ...connectionData,
        isBidirectional: connectionData.isBidirectional !== false, // Default true
        distance: 0,
        travelTime: 0,
        isActive: true,
        createdAt: Timestamp.now(),
        createdBy: auth.currentUser?.email || 'system'
      });

      return docRef.id;
    } catch (error) {
      console.error('Error adding connection:', error);
      throw error;
    }
  },

  // Check if connection exists
  checkConnectionExists: async (fromStopId, toStopId) => {
    try {
      // Check forward direction
      const forwardQuery = query(
        collection(db, CONNECTIONS_COLLECTION),
        where('fromStopId', '==', fromStopId),
        where('toStopId', '==', toStopId)
      );
      const forwardSnap = await getDocs(forwardQuery);

      if (!forwardSnap.empty) return true;

      // Check reverse direction
      const reverseQuery = query(
        collection(db, CONNECTIONS_COLLECTION),
        where('fromStopId', '==', toStopId),
        where('toStopId', '==', fromStopId)
      );
      const reverseSnap = await getDocs(reverseQuery);

      return !reverseSnap.empty;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  },

  // Update connection
  updateConnection: async (connectionId, connectionData) => {
    try {
      await updateDoc(doc(db, CONNECTIONS_COLLECTION, connectionId), {
        ...connectionData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating connection:', error);
      throw error;
    }
  },

  // Delete connection
  deleteConnection: async (connectionId) => {
    try {
      await deleteDoc(doc(db, CONNECTIONS_COLLECTION, connectionId));
    } catch (error) {
      console.error('Error deleting connection:', error);
      throw error;
    }
  },

  // Get connections for a specific stop
  getConnectionsForStop: async (stopId) => {
    try {
      // Get connections where stop is source
      const fromQuery = query(
        collection(db, CONNECTIONS_COLLECTION),
        where('fromStopId', '==', stopId)
      );
      const fromSnap = await getDocs(fromQuery);

      // Get connections where stop is destination
      const toQuery = query(
        collection(db, CONNECTIONS_COLLECTION),
        where('toStopId', '==', stopId)
      );
      const toSnap = await getDocs(toQuery);

      const connections = [
        ...fromSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), direction: 'from' })),
        ...toSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), direction: 'to' }))
      ];

      return connections;
    } catch (error) {
      console.error('Error getting connections for stop:', error);
      throw error;
    }
  }
};
