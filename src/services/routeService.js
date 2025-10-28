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
    const directRoutes = [];
    const connectingRoutes = [];

    // Find direct routes (including reverse direction)
    for (const route of allRoutes) {
      // Get stops for this route
      const routeWithStops = await routeService.getRouteById(route.id);

      // Find from and to stop positions
      const fromIndex = routeWithStops.stops.findIndex(s => s.stopId === fromStopId);
      const toIndex = routeWithStops.stops.findIndex(s => s.stopId === toStopId);

      // Check if route contains both stops in correct order (forward direction)
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        directRoutes.push({
          ...routeWithStops,
          fromStopIndex: fromIndex,
          toStopIndex: toIndex,
          stopsInJourney: routeWithStops.stops.slice(fromIndex, toIndex + 1),
          routeType: 'direct',
          direction: 'forward'
        });
      }
      // Check if route contains both stops in reverse order (backward direction)
      else if (fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex) {
        directRoutes.push({
          ...routeWithStops,
          fromStopIndex: toIndex,
          toStopIndex: fromIndex,
          stopsInJourney: routeWithStops.stops.slice(toIndex, fromIndex + 1).reverse(),
          routeType: 'direct',
          direction: 'reverse',
          note: 'This route runs in the opposite direction'
        });
      }
    }

    // Find connecting routes (routes with one transfer)
    for (let i = 0; i < allRoutes.length; i++) {
      for (let j = i + 1; j < allRoutes.length; j++) {
        const route1WithStops = await routeService.getRouteById(allRoutes[i].id);
        const route2WithStops = await routeService.getRouteById(allRoutes[j].id);

        // Find indices in route1
        const fromIndexRoute1 = route1WithStops.stops.findIndex(s => s.stopId === fromStopId);
        const toIndexRoute1 = route1WithStops.stops.findIndex(s => s.stopId === toStopId);

        // Find indices in route2
        const fromIndexRoute2 = route2WithStops.stops.findIndex(s => s.stopId === fromStopId);
        const toIndexRoute2 = route2WithStops.stops.findIndex(s => s.stopId === toStopId);

        // Check all possible combinations for connecting routes

        // Case 1: fromStop on route1, toStop on route2
        if (fromIndexRoute1 !== -1 && toIndexRoute2 !== -1) {
          // Find common stops between route1 (after fromStop) and route2 (before toStop)
          for (let k = fromIndexRoute1; k < route1WithStops.stops.length; k++) {
            const potentialTransferStopId = route1WithStops.stops[k].stopId;
            const transferIndexRoute2 = route2WithStops.stops.findIndex(s => s.stopId === potentialTransferStopId);

            if (transferIndexRoute2 !== -1 && transferIndexRoute2 < toIndexRoute2 && k > fromIndexRoute1) {
              connectingRoutes.push({
                routeType: 'connecting',
                route1: route1WithStops,
                route2: route2WithStops,
                transferStop: route1WithStops.stops[k],
                leg1: {
                  ...route1WithStops,
                  fromStopIndex: fromIndexRoute1,
                  toStopIndex: k,
                  stopsInJourney: route1WithStops.stops.slice(fromIndexRoute1, k + 1)
                },
                leg2: {
                  ...route2WithStops,
                  fromStopIndex: transferIndexRoute2,
                  toStopIndex: toIndexRoute2,
                  stopsInJourney: route2WithStops.stops.slice(transferIndexRoute2, toIndexRoute2 + 1)
                },
                totalFare: parseFloat(route1WithStops.fare || 0) + parseFloat(route2WithStops.fare || 0)
              });
              break; // Only add the first transfer point to avoid duplicates
            }
          }
        }

        // Case 2: fromStop on route2, toStop on route1
        if (fromIndexRoute2 !== -1 && toIndexRoute1 !== -1) {
          // Find common stops between route2 (after fromStop) and route1 (before toStop)
          for (let k = fromIndexRoute2; k < route2WithStops.stops.length; k++) {
            const potentialTransferStopId = route2WithStops.stops[k].stopId;
            const transferIndexRoute1 = route1WithStops.stops.findIndex(s => s.stopId === potentialTransferStopId);

            if (transferIndexRoute1 !== -1 && transferIndexRoute1 < toIndexRoute1 && k > fromIndexRoute2) {
              connectingRoutes.push({
                routeType: 'connecting',
                route1: route2WithStops,
                route2: route1WithStops,
                transferStop: route2WithStops.stops[k],
                leg1: {
                  ...route2WithStops,
                  fromStopIndex: fromIndexRoute2,
                  toStopIndex: k,
                  stopsInJourney: route2WithStops.stops.slice(fromIndexRoute2, k + 1)
                },
                leg2: {
                  ...route1WithStops,
                  fromStopIndex: transferIndexRoute1,
                  toStopIndex: toIndexRoute1,
                  stopsInJourney: route1WithStops.stops.slice(transferIndexRoute1, toIndexRoute1 + 1)
                },
                totalFare: parseFloat(route2WithStops.fare || 0) + parseFloat(route1WithStops.fare || 0)
              });
              break; // Only add the first transfer point to avoid duplicates
            }
          }
        }
      }
    }

    // Return direct routes first, then connecting routes
    return [...directRoutes, ...connectingRoutes];
  }
};
