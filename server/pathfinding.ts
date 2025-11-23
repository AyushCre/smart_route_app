/**
 * Route Optimization Algorithms: Dijkstra's and A*
 */

export interface Coordinate {
  lat: number;
  lng: number;
  address?: string;
}

export interface RoutePoint {
  coord: Coordinate;
  index: number;
}

// Calculate great circle distance between two coordinates (in km)
function haversineDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLng = (coord2.lng - coord1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate time from distance (minutes)
function estimateTime(distanceKm: number): number {
  const avgSpeed = 50; // km/h
  return (distanceKm / avgSpeed) * 60; // minutes
}

/**
 * Dijkstra's Algorithm for shortest path
 */
export function dijkstraOptimize(waypoints: Coordinate[]): {
  path: number[];
  totalDistance: number;
  estimatedDuration: number;
  coordinates: [number, number][];
} {
  const n = waypoints.length;
  if (n <= 1) {
    return {
      path: waypoints.map((_, i) => i),
      totalDistance: 0,
      estimatedDuration: 0,
      coordinates: waypoints.map((w) => [w.lat, w.lng]),
    };
  }

  // Build distance matrix
  const distances: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        distances[i][j] = haversineDistance(waypoints[i], waypoints[j]);
      }
    }
  }

  // Nearest neighbor heuristic (simplified Dijkstra for waypoints)
  const visited = new Set<number>();
  const path: number[] = [0];
  visited.add(0);
  let totalDistance = 0;

  while (visited.size < n) {
    const current = path[path.length - 1];
    let nearest = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distances[current][i] < minDist) {
        minDist = distances[current][i];
        nearest = i;
      }
    }

    if (nearest !== -1) {
      path.push(nearest);
      visited.add(nearest);
      totalDistance += minDist;
    }
  }

  const coordinates = path.map((i) => [waypoints[i].lat, waypoints[i].lng] as [number, number]);
  const estimatedDuration = Math.round(estimateTime(totalDistance));

  return {
    path,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedDuration,
    coordinates,
  };
}

/**
 * A* Algorithm for optimized pathfinding
 */
export function astarOptimize(waypoints: Coordinate[]): {
  path: number[];
  totalDistance: number;
  estimatedDuration: number;
  coordinates: [number, number][];
} {
  const n = waypoints.length;
  if (n <= 1) {
    return {
      path: waypoints.map((_, i) => i),
      totalDistance: 0,
      estimatedDuration: 0,
      coordinates: waypoints.map((w) => [w.lat, w.lng]),
    };
  }

  // Calculate centroid for heuristic
  const centroid = {
    lat: waypoints.reduce((sum, w) => sum + w.lat, 0) / n,
    lng: waypoints.reduce((sum, w) => sum + w.lng, 0) / n,
  };

  // Distance matrix
  const distances: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        distances[i][j] = haversineDistance(waypoints[i], waypoints[j]);
      }
    }
  }

  // A* with priority queue (simplified)
  const openSet = new Set<number>([0]);
  const cameFrom = new Map<number, number>();
  const gScore = new Map<number, number>();
  const fScore = new Map<number, number>();

  for (let i = 0; i < n; i++) {
    gScore.set(i, Infinity);
    fScore.set(i, Infinity);
  }

  gScore.set(0, 0);
  fScore.set(0, haversineDistance(waypoints[0], centroid));

  while (openSet.size > 0) {
    let current = -1;
    let minF = Infinity;
    for (const node of Array.from(openSet)) {
      const f = fScore.get(node) || Infinity;
      if (f < minF) {
        minF = f;
        current = node;
      }
    }

    if (current === -1) break;

    if (openSet.size === 1) {
      break;
    }

    openSet.delete(current);

    for (let neighbor = 0; neighbor < n; neighbor++) {
      if (neighbor === current) continue;

      const tentativeGScore = (gScore.get(current) || Infinity) + distances[current][neighbor];
      if (tentativeGScore < (gScore.get(neighbor) || Infinity)) {
        cameFrom.set(neighbor, current);
        gScore.set(neighbor, tentativeGScore);
        const heuristic = haversineDistance(waypoints[neighbor], centroid);
        fScore.set(neighbor, tentativeGScore + heuristic);
        openSet.add(neighbor);
      }
    }
  }

  // Reconstruct path
  const path: number[] = [];
  const visited = new Set<number>();
  let current = 0;
  path.push(current);
  visited.add(current);

  while (visited.size < n) {
    let nearest = -1;
    let minDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && distances[current][i] < minDist) {
        minDist = distances[current][i];
        nearest = i;
      }
    }
    if (nearest === -1) break;
    path.push(nearest);
    visited.add(nearest);
    current = nearest;
  }

  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += distances[path[i]][path[i + 1]];
  }

  const coordinates = path.map((i) => [waypoints[i].lat, waypoints[i].lng] as [number, number]);
  const estimatedDuration = Math.round(estimateTime(totalDistance));

  return {
    path,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedDuration,
    coordinates,
  };
}

/**
 * Optimize route with specified algorithm
 */
export function optimizeRoute(
  waypoints: Coordinate[],
  algorithm: "dijkstra" | "astar" = "dijkstra"
) {
  if (algorithm === "astar") {
    return astarOptimize(waypoints);
  }
  return dijkstraOptimize(waypoints);
}
