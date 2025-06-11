import { NextRequest, NextResponse } from 'next/server';
import { getTemporalClient } from '@/temporal/client';
import { 
  getTrafficStatusQuery, 
  getMonitoringStateQuery, 
  getNotificationStatusQuery 
} from '@/temporal/workflows/traffic-monitoring-workflow';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;
    
    const client = await getTemporalClient();

    const handle = client.workflow.getHandle(workflowId);
    
    const [trafficStatus, monitoringState, notificationStatus] = await Promise.all([
      handle.query(getTrafficStatusQuery),
      handle.query(getMonitoringStateQuery),
      handle.query(getNotificationStatusQuery),
    ]);

    const description = await handle.describe();

    return NextResponse.json({
      workflowId,
      monitoringState,
      trafficStatus,
      notificationStatus,
      executionStatus: description.status.name,
      startTime: description.startTime,
      closeTime: description.closeTime,
    });

  } catch (error) {
    console.error('Error querying traffic monitoring workflow:', error);
    return NextResponse.json(
      { error: 'Failed to query traffic monitoring workflow status' },
      { status: 500 }
    );
  }
} 