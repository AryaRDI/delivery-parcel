import axios from 'axios';
import { DeliveryRoute, TrafficData } from '../../types';

export interface RouteTrafficOptions {
  origin: string;
  destination: string;
  estimatedDurationMinutes: number;
  routeId: string;
}

export class GoogleRoutesService {
  static isConfigured(): boolean {
    return !!process.env.GOOGLE_MAPS_API_KEY;
  }

  static async fetchTrafficData(route: DeliveryRoute): Promise<TrafficData> {
    console.log(`🗺️ Fetching traffic data for route ${route.routeId}: ${route.origin} → ${route.destination}`);
    
    if (!this.isConfigured()) {
      console.warn('⚠️ Google Maps API key not configured, using mock data');
      return this.generateMockTrafficData(route);
    }

    try {
      const requestBody = {
        origin: {
          address: route.origin
        },
        destination: {
          address: route.destination
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE_OPTIMAL'
      };

      console.log('📡 Routes API request:', JSON.stringify(requestBody, null, 2));

      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
            'X-Goog-FieldMask': 'routes.duration,routes.staticDuration,routes.distanceMeters'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (!response.data.routes || response.data.routes.length === 0) {
        console.error('❌ Google Routes API error: No routes found');
        return this.generateMockTrafficData(route);
      }

      const routeData = response.data.routes[0];
      console.log('📊 Route data received:', JSON.stringify(routeData, null, 2));
      
      return this.processRouteData(routeData, route);

    } catch (error) {
      console.error('❌ Google Routes service error:', error);
      
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response headers:', error.response.headers);
      }
      
      console.log('🔄 Falling back to mock traffic data');
      return this.generateMockTrafficData(route);
    }
  }

  private static processRouteData(routeData: any, route: DeliveryRoute): TrafficData {
    const currentDurationSeconds = parseInt(routeData.duration?.replace('s', '') || '0');
    const staticDurationSeconds = parseInt(routeData.staticDuration?.replace('s', '') || currentDurationSeconds.toString());
    const currentDurationMinutes = Math.ceil(currentDurationSeconds / 60);
    const staticDurationMinutes = Math.ceil(staticDurationSeconds / 60);
    const estimatedDurationMinutes = route.estimatedDurationMinutes;
    
    // Calculate delay based on current vs estimated duration
    const delayMinutes = Math.max(0, currentDurationMinutes - estimatedDurationMinutes);
    
    // Determine traffic condition based on delay and traffic impact
    const trafficImpact = currentDurationMinutes - staticDurationMinutes;
    let trafficCondition: TrafficData['trafficCondition'] = 'light';
    
    if (delayMinutes > 30 || trafficImpact > 20) trafficCondition = 'severe';
    else if (delayMinutes > 15 || trafficImpact > 10) trafficCondition = 'heavy';
    else if (delayMinutes > 5 || trafficImpact > 5) trafficCondition = 'moderate';

    const trafficData: TrafficData = {
      routeId: route.routeId,
      currentDurationMinutes,
      estimatedDurationMinutes,
      delayMinutes,
      trafficCondition,
      lastUpdated: new Date(),
      source: 'google_routes_api'
    };

    console.log(`✅ Traffic data processed:`, {
      route: route.routeId,
      delay: `${delayMinutes} minutes`,
      condition: trafficCondition,
      current: `${currentDurationMinutes}min`,
      estimated: `${estimatedDurationMinutes}min`,
      staticDuration: `${staticDurationMinutes}min`,
      trafficImpact: `+${trafficImpact}min`
    });

    return trafficData;
  }

  private static generateMockTrafficData(route: DeliveryRoute): TrafficData {
    // Simulate realistic traffic conditions
    const delayVariations = [0, 5, 10, 15, 25, 35, 45];
    const randomDelay = delayVariations[Math.floor(Math.random() * delayVariations.length)];
    const currentDurationMinutes = route.estimatedDurationMinutes + randomDelay;
    
    let trafficCondition: TrafficData['trafficCondition'] = 'light';
    if (randomDelay > 30) trafficCondition = 'severe';
    else if (randomDelay > 15) trafficCondition = 'heavy';
    else if (randomDelay > 5) trafficCondition = 'moderate';

    const mockData: TrafficData = {
      routeId: route.routeId,
      currentDurationMinutes,
      estimatedDurationMinutes: route.estimatedDurationMinutes,
      delayMinutes: randomDelay,
      trafficCondition,
      lastUpdated: new Date(),
      source: 'mock'
    };

    console.log(`🎭 Generated mock traffic data:`, {
      route: route.routeId,
      delay: `${randomDelay} minutes`,
      condition: trafficCondition,
      source: 'mock'
    });

    return mockData;
  }
}
