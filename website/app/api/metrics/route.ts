import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const { projectId, metrics } = await req.json();

    // Validate input
    if (!projectId || !metrics) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Update database when Neon is connected
    // For now, just log the update and revalidate paths
    console.log('Metrics update requested:', { projectId, metrics });

    // Revalidate affected pages (ISR)
    revalidatePath('/');
    revalidatePath('/portfolio');
    revalidatePath(`/portfolio/${projectId}`);

    return NextResponse.json({
      success: true,
      message: 'Metrics updated successfully'
    });
  } catch (error) {
    console.error('Metrics update error:', error);
    return NextResponse.json(
      { error: 'Failed to update metrics' },
      { status: 500 }
    );
  }
}
