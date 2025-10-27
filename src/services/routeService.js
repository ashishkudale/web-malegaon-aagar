import {
  collection, addDoc, updateDoc, deleteDoc, doc,
  getDocs, getDoc, query, where, orderBy, Timestamp
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { stopService } from './stopService';

export const routeService = {
  // Get all routes
  getAllRoutes: async () => {
    const querySnapshot = await getDocs(
      query(collection(db, 'routes'), orderBy('routeNumber'))
    );
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // Get route with stops
  getRouteById: async (routeId) => {
    try {
      // Get route
      const routeDoc = await getDoc(doc(db, 'routes', routeId));
      if (!routeDoc.exists()) throw new Error('Route not found');

      // Get route stops - using where() only to avoid index requirement
      const stopsQuery = query(
        collection(db, 'routeStops'),
        where('routeId', '==', routeId)
      );
      const stopsSnapshot = await getDocs(stopsQuery);

      // Get full stop details
      const routeStops = await Promise.all(
        stopsSnapshot.docs.map(async (stopDoc) => {
          const stopData = stopDoc.data();
          const stopDetails = await stopService.getStopById(stopData.stopId);
          return {
            id: stopDoc.id,
            ...stopData,
            stopDetails
          };
        })
      );

      // Sort by stopSequence on the client side
      routeStops.sort((a, b) => a.stopSequence - b.stopSequence);

      return {
        id: routeDoc.id,
        ...routeDoc.data(),
        stops: routeStops
      };
    } catch (error) {
      console.error('Error in getRouteById:', error);
      throw error;
    }
  },

  // Create route with stops
  createRoute: async (routeData, stops) => {
    // Create route
    const routeRef = await addDoc(collection(db, 'routes'), {
      ...routeData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: auth.currentUser?.email
    });

    // Create route-stops
    for (let i = 0; i < stops.length; i++) {
      await addDoc(collection(db, 'routeStops'), {
        routeId: routeRef.id,
        stopId: stops[i].stopId,
        stopSequence: i + 1,
        distanceFromPrevious: stops[i].distanceFromPrevious || 0,
        estimatedTimeFromPrevious: stops[i].estimatedTimeFromPrevious || 0,
        createdAt: Timestamp.now()
      });
    }

    return routeRef.id;
  },

  // Update route
  updateRoute: async (routeId, routeData) => {
    await updateDoc(doc(db, 'routes', routeId), {
      ...routeData,
      updatedAt: Timestamp.now()
    });
  },

  // Delete route
  deleteRoute: async (routeId) => {
    // Delete route
    await deleteDoc(doc(db, 'routes', routeId));

    // Delete route-stops
    const stopsQuery = query(
      collection(db, 'routeStops'),
      where('routeId', '==', routeId)
    );
    const stopsSnapshot = await getDocs(stopsQuery);
    for (const stopDoc of stopsSnapshot.docs) {
      await deleteDoc(doc(db, 'routeStops', stopDoc.id));
    }
  },

  // Search routes between two stops
  searchRoutes: async (fromStopId, toStopId) => {
    // Get all routes
    const allRoutes = await routeService.getAllRoutes();
    const matchingRoutes = [];

    for (const route of allRoutes) {
      // Get stops for this route
      const routeWithStops = await routeService.getRouteById(route.id);

      // Find from and to stop positions
      const fromIndex = routeWithStops.stops.findIndex(s => s.stopId === fromStopId);
      const toIndex = routeWithStops.stops.findIndex(s => s.stopId === toStopId);

      // Check if route contains both stops in correct order
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        matchingRoutes.push({
          ...routeWithStops,
          fromStopIndex: fromIndex,
          toStopIndex: toIndex,
          stopsInJourney: routeWithStops.stops.slice(fromIndex, toIndex + 1)
        });
      }
    }

    return matchingRoutes;
  }
};
