import { connectionService } from './connectionService';
import { stopService } from './stopService';

export const graphService = {
  // Build adjacency list from connections
  buildGraph: async () => {
    try {
      const connections = await connectionService.getAllConnections();
      const graph = {};

      connections.forEach(conn => {
        if (!conn.isActive) return;

        // Add forward edge
        if (!graph[conn.fromStopId]) {
          graph[conn.fromStopId] = [];
        }
        graph[conn.fromStopId].push(conn.toStopId);

        // Add reverse edge if bidirectional
        if (conn.isBidirectional) {
          if (!graph[conn.toStopId]) {
            graph[conn.toStopId] = [];
          }
          graph[conn.toStopId].push(conn.fromStopId);
        }
      });

      return graph;
    } catch (error) {
      console.error('Error building graph:', error);
      throw error;
    }
  },

  // Find ALL possible paths using DFS
  findAllPaths: (graph, start, end, maxDepth = 100) => {
    const allPaths = [];
    const visited = new Set();

    const dfs = (current, target, path) => {
      // Avoid cycles and limit depth
      if (path.length > maxDepth) return;

      // Found target
      if (current === target) {
        allPaths.push([...path, current]);
        return;
      }

      // Mark as visited for this path
      visited.add(current);

      // Explore neighbors
      const neighbors = graph[current] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, target, [...path, current]);
        }
      }

      // Backtrack
      visited.delete(current);
    };

    dfs(start, end, []);
    return allPaths;
  },

  // Find shortest path using BFS
  findShortestPath: (graph, start, end) => {
    if (start === end) return [start];

    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
      const path = queue.shift();
      const node = path[path.length - 1];

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        if (neighbor === end) {
          return [...path, neighbor];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push([...path, neighbor]);
        }
      }
    }

    return null; // No path found
  },

  // Main search function - Find all routes
  searchAllRoutes: async (fromStopId, toStopId) => {
    try {
      console.log('🔍 Building graph...');
      const graph = await graphService.buildGraph();

      console.log('📊 Graph structure:', graph);
      console.log('🔍 Finding all paths from', fromStopId, 'to', toStopId);

      const allPaths = graphService.findAllPaths(graph, fromStopId, toStopId);

      if (allPaths.length === 0) {
        console.log('❌ No paths found');
        return [];
      }

      console.log(`✅ Found ${allPaths.length} paths`);
      allPaths.forEach((path, idx) => {
        console.log(`Path ${idx + 1}:`, path);
      });

      // Get stop details for all paths
      const pathsWithDetails = await Promise.all(
        allPaths.map(async (path) => {
          const stopsDetails = await Promise.all(
            path.map(stopId => stopService.getStopById(stopId))
          );

          return {
            type: 'graph-path',
            path: path,
            stops: stopsDetails,
            totalStops: path.length,
            isShortestPath: path.length === Math.min(...allPaths.map(p => p.length))
          };
        })
      );

      // Sort by path length (shortest first)
      pathsWithDetails.sort((a, b) => a.totalStops - b.totalStops);

      return pathsWithDetails;
    } catch (error) {
      console.error('Error searching routes:', error);
      throw error;
    }
  },

  // Check if graph is connected
  isGraphConnected: async () => {
    try {
      const graph = await graphService.buildGraph();
      const nodes = Object.keys(graph);

      if (nodes.length === 0) return true;

      const visited = new Set();
      const queue = [nodes[0]];
      visited.add(nodes[0]);

      while (queue.length > 0) {
        const node = queue.shift();
        const neighbors = graph[node] || [];

        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }

      return visited.size === nodes.length;
    } catch (error) {
      console.error('Error checking connectivity:', error);
      return false;
    }
  }
};
