import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  sleep,
} from '@temporalio/workflow';
import type { 
  TrafficMonitoringActivities, 
  DeliveryRoute, 
  TrafficMonitoringResult,
  TrafficData,
  DelayNotification
} from '../types';

const {
  fetchTrafficData,
  generateDelayMessage,
  sendDelayNotification,
  logTrafficEvent,
} = proxyActivities<TrafficMonitoringActivities>({
  startToCloseTimeout: '5 minutes',
  retry: {
    initialInterval: '2 seconds',
    maximumInterval: '30 seconds',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

export const stopMonitoringSignal = defineSignal('stopMonitoring');
export const updateRouteSignal = defineSignal<[DeliveryRoute]>('updateRoute');

export const getTrafficStatusQuery = defineQuery<TrafficData | null>('getTrafficStatus');
export const getMonitoringStateQuery = defineQuery<string>('getMonitoringState');
export const getNotificationStatusQuery = defineQuery<DelayNotification | undefined>('getNotificationStatus');

export async function trafficMonitoringWorkflow(route: DeliveryRoute): Promise<TrafficMonitoringResult> {
  console.log(`🎯 Starting traffic monitoring workflow for route ${route.routeId}`);
  
  let currentTrafficData: TrafficData | null = null;
  let monitoringState = 'initializing';
  let stopMonitoring = false;
  let notificationDetails: DelayNotification | undefined = undefined;
  let updatedRoute = route;

  setHandler(stopMonitoringSignal, () => {
    console.log(`🛑 Stop monitoring signal received for route ${route.routeId}`);
    stopMonitoring = true;
    monitoringState = 'stopped';
  });

  setHandler(updateRouteSignal, (newRoute: DeliveryRoute) => {
    console.log(`🔄 Route update signal received for route ${route.routeId}`);
    updatedRoute = newRoute;
  });

  setHandler(getTrafficStatusQuery, () => currentTrafficData);
  setHandler(getMonitoringStateQuery, () => monitoringState);
  setHandler(getNotificationStatusQuery, () => notificationDetails);

  try {
    await logTrafficEvent(route.routeId, 'Monitoring started', {
      origin: route.origin,
      destination: route.destination,
      threshold: route.delayThresholdMinutes
    });

    monitoringState = 'monitoring';

    console.log(`📍 Step 1: Fetching traffic data for route ${route.routeId}`);
    currentTrafficData = await fetchTrafficData(updatedRoute);
    
    await logTrafficEvent(route.routeId, 'Traffic data fetched', {
      delay: currentTrafficData.delayMinutes,
      condition: currentTrafficData.trafficCondition,
      source: currentTrafficData.source
    });

    console.log(`⏱️ Step 2: Checking delay threshold (${currentTrafficData.delayMinutes}min vs ${updatedRoute.delayThresholdMinutes}min threshold)`);
    
    const result: TrafficMonitoringResult = {
      routeId: route.routeId,
      finalDelayMinutes: currentTrafficData.delayMinutes,
      notificationSent: false,
      monitoringCompleted: false
    };

    if (currentTrafficData.delayMinutes <= updatedRoute.delayThresholdMinutes) {
      console.log(`✅ Delay of ${currentTrafficData.delayMinutes} minutes is within threshold. No notification needed.`);
      
      monitoringState = 'completed_no_notification';
      
      await logTrafficEvent(route.routeId, 'No notification needed', {
        delay: currentTrafficData.delayMinutes,
        threshold: updatedRoute.delayThresholdMinutes
      });

      result.monitoringCompleted = true;
      return result;
    }

    console.log(`⚠️ Significant delay detected: ${currentTrafficData.delayMinutes} minutes (threshold: ${updatedRoute.delayThresholdMinutes} minutes)`);
    
    monitoringState = 'delay_detected';

    await logTrafficEvent(route.routeId, 'Significant delay detected', {
      delay: currentTrafficData.delayMinutes,
      threshold: updatedRoute.delayThresholdMinutes,
      condition: currentTrafficData.trafficCondition
    });

    if (stopMonitoring) {
      console.log(`🛑 Monitoring stopped before notification for route ${route.routeId}`);
      result.monitoringCompleted = true;
      return result;
    }

    console.log(`📤 Step 3: Sending delay notification to customer`);
    monitoringState = 'sending_notification';
    
    notificationDetails = await sendDelayNotification(
      updatedRoute, 
      currentTrafficData
    );

    await logTrafficEvent(route.routeId, 'Notification sent', {
      success: notificationDetails.success,
      notificationType: notificationDetails.notificationType,
      error: notificationDetails.error || null
    });

    result.notificationSent = notificationDetails.success;
    result.notificationDetails = notificationDetails;
    result.monitoringCompleted = true;
    
    if (notificationDetails.success) {
      console.log(`✅ Traffic monitoring workflow completed successfully for route ${route.routeId}`);
      monitoringState = 'completed_success';
    } else {
      console.log(`⚠️ Traffic monitoring workflow completed with notification failure for route ${route.routeId}`);
      monitoringState = 'completed_error';
    }

    await logTrafficEvent(route.routeId, 'Monitoring completed', {
      finalDelay: currentTrafficData.delayMinutes,
      notificationSent: result.notificationSent
    });

    return result;

  } catch (error) {
    console.error(`❌ Traffic monitoring workflow failed for route ${route.routeId}:`, error);
    
    monitoringState = 'failed';
    
    await logTrafficEvent(route.routeId, 'Workflow failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return {
      routeId: route.routeId,
      finalDelayMinutes: currentTrafficData?.delayMinutes || 0,
      notificationSent: false,
      notificationDetails: notificationDetails,
      monitoringCompleted: true
    };
  }
}
