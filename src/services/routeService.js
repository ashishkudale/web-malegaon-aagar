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

  // ===== ENHANCED SEARCH WITH TRANSFERS =====

  // Search routes between two stops (with transfers)
  searchRoutes: async (fromStopId, toStopId) => {
    console.log('🔍 Searching routes from', fromStopId, 'to', toStopId);

    // Get all routes with their stops
    const allRoutes = await routeService.getAllRoutes();
    console.log('📋 Total routes found:', allRoutes.length);

    const routesWithStops = await Promise.all(
      allRoutes.map(route => routeService.getRouteById(route.id))
    );

    console.log('📋 Routes with stops loaded:', routesWithStops.length);
    routesWithStops.forEach(route => {
      console.log(`Route ${route.routeNumber}: ${route.stops.length} stops`);
      console.log('Stop IDs:', route.stops.map(s => s.stopId));
    });

    // Find direct routes (no transfer needed)
    const directRoutes = routeService._findDirectRoutes(
      routesWithStops,
      fromStopId,
      toStopId
    );

    // Find routes with one transfer
    const transferRoutes = routeService._findTransferRoutes(
      routesWithStops,
      fromStopId,
      toStopId
    );

    // Combine and sort results
    const allResults = [...directRoutes, ...transferRoutes];

    // Sort by: Direct routes first, then by number of stops
    allResults.sort((a, b) => {
      if (a.isDirect && !b.isDirect) return -1;
      if (!a.isDirect && b.isDirect) return 1;
      return a.totalStops - b.totalStops;
    });

    console.log(`✅ Found ${allResults.length} routes (${directRoutes.length} direct, ${transferRoutes.length} with transfer)`);

    return allResults;
  },

  // Find direct routes (no transfer)
  _findDirectRoutes: (routesWithStops, fromStopId, toStopId) => {
    const directRoutes = [];

    for (const route of routesWithStops) {
      const fromIndex = route.stops.findIndex(s => s.stopId === fromStopId);
      const toIndex = route.stops.findIndex(s => s.stopId === toStopId);

      // Check if route contains both stops in correct order (forward direction)
      if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
        const journeyStops = route.stops.slice(fromIndex, toIndex + 1);

        directRoutes.push({
          type: 'direct',
          isDirect: true,
          routes: [route],
          fromStopIndex: fromIndex,
          toStopIndex: toIndex,
          journeyStops: journeyStops,
          totalStops: journeyStops.length,
          totalDistance: routeService._calculateDistance(journeyStops),
          totalTime: routeService._calculateTime(journeyStops),
          routeInfo: {
            routeId: route.id,
            routeNumber: route.routeNumber,
            routeNameEnglish: route.routeNameEnglish,
            routeNameMarathi: route.routeNameMarathi,
            fare: route.fare
          }
        });
      }
      // Check if route contains both stops in reverse order (backward direction)
      else if (fromIndex !== -1 && toIndex !== -1 && toIndex < fromIndex) {
        const journeyStops = route.stops.slice(toIndex, fromIndex + 1).reverse();

        directRoutes.push({
          type: 'direct',
          isDirect: true,
          routes: [route],
          fromStopIndex: toIndex,
          toStopIndex: fromIndex,
          journeyStops: journeyStops,
          totalStops: journeyStops.length,
          totalDistance: routeService._calculateDistance(journeyStops),
          totalTime: routeService._calculateTime(journeyStops),
          isReverse: true,
          routeInfo: {
            routeId: route.id,
            routeNumber: route.routeNumber,
            routeNameEnglish: route.routeNameEnglish,
            routeNameMarathi: route.routeNameMarathi,
            fare: route.fare,
            note: '⚠️ This route runs in the opposite direction'
          }
        });
      }
    }

    return directRoutes;
  },

  // Find routes with one transfer
  _findTransferRoutes: (routesWithStops, fromStopId, toStopId) => {
    const transferRoutes = [];

    // Try each route as first leg
    for (const route1 of routesWithStops) {
      const fromIndex1 = route1.stops.findIndex(s => s.stopId === fromStopId);

      // Skip if this route doesn't have the starting stop
      if (fromIndex1 === -1) continue;

      // Get all possible transfer points (stops after fromStop in route1)
      const possibleTransfers = route1.stops.slice(fromIndex1 + 1);

      // Try each route as second leg
      for (const route2 of routesWithStops) {
        // Skip same route
        if (route1.id === route2.id) continue;

        const toIndex2 = route2.stops.findIndex(s => s.stopId === toStopId);

        // Skip if second route doesn't have the destination
        if (toIndex2 === -1) continue;

        // Find common stops (transfer points)
        for (const transferStop of possibleTransfers) {
          const transferIndex2 = route2.stops.findIndex(s => s.stopId === transferStop.stopId);

          // Check if transfer stop exists in route2 and comes before destination
          if (transferIndex2 !== -1 && transferIndex2 < toIndex2) {
            // We found a valid transfer!
            const leg1Stops = route1.stops.slice(
              fromIndex1,
              route1.stops.findIndex(s => s.stopId === transferStop.stopId) + 1
            );

            const leg2Stops = route2.stops.slice(
              transferIndex2,
              toIndex2 + 1
            );

            // Combine stops (remove duplicate transfer stop)
            const allStops = [...leg1Stops, ...leg2Stops.slice(1)];

            transferRoutes.push({
              type: 'transfer',
              isDirect: false,
              routes: [route1, route2],
              transferPoint: {
                stopId: transferStop.stopId,
                stopDetails: transferStop.stopDetails,
                fromRoute: route1.routeNumber,
                toRoute: route2.routeNumber
              },
              leg1: {
                route: route1,
                stops: leg1Stops,
                fromIndex: fromIndex1,
                toIndex: route1.stops.findIndex(s => s.stopId === transferStop.stopId)
              },
              leg2: {
                route: route2,
                stops: leg2Stops,
                fromIndex: transferIndex2,
                toIndex: toIndex2
              },
              journeyStops: allStops,
              totalStops: allStops.length,
              totalDistance: routeService._calculateDistance(allStops),
              totalTime: routeService._calculateTime(allStops),
              totalFare: parseFloat(route1.fare) + parseFloat(route2.fare)
            });

            // Only add the first valid transfer point between these two routes
            break;
          }
        }
      }
    }

    return transferRoutes;
  },

  // Calculate total distance
  _calculateDistance: (stops) => {
    return stops.reduce((total, stop, index) => {
      if (index === 0) return 0;
      return total + (parseFloat(stop.distanceFromPrevious) || 0);
    }, 0);
  },

  // Calculate total time
  _calculateTime: (stops) => {
    return stops.reduce((total, stop, index) => {
      if (index === 0) return 0;
      return total + (parseInt(stop.estimatedTimeFromPrevious) || 0);
    }, 0);
  }
};
