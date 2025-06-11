import { NextRequest, NextResponse } from 'next/server';
import { getTemporalClient } from '@/temporal/client';
import { DeliveryRoute } from '@/temporal/types';

export async function POST(request: NextRequest) {
  try {
    const body: DeliveryRoute = await request.json();
    
    // Validate request
    if (!body.routeId || !body.origin || !body.destination || !body.customerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: routeId, origin, destination, customerEmail' },
        { status: 400 }
      );
    }

    // Set default values if not provided
    const route: DeliveryRoute = {
      ...body,
      estimatedDurationMinutes: body.estimatedDurationMinutes || 60,
      delayThresholdMinutes: body.delayThresholdMinutes || 30,
    };

    const client = await getTemporalClient();
    
    // Start the traffic monitoring workflow
    const handle = await client.workflow.start('trafficMonitoringWorkflow', {
      args: [route],
      taskQueue: 'traffic-monitoring-queue',
      workflowId: `traffic-monitor-${route.routeId}`,
    });

    return NextResponse.json({
      success: true,
      workflowId: handle.workflowId,
      runId: handle.firstExecutionRunId,
      message: `Traffic monitoring started for route ${route.routeId}`,
    });

  } catch (error) {
    console.error('Error starting traffic monitoring workflow:', error);
    return NextResponse.json(
      { error: 'Failed to start traffic monitoring workflow' },
      { status: 500 }
    );
  }
} 