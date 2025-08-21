import { NextRequest, NextResponse } from 'next/server';
import { getCachedNavigation } from '@/lib/navigation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const { version } = await params;
    
    // Validate version format
    if (!/^v\d+\.\d+\.\d+$/.test(version)) {
      return NextResponse.json(
        { error: 'Invalid version format' },
        { status: 400 }
      );
    }
    
    const navigation = getCachedNavigation(version);
    
    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Error fetching navigation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    );
  }
}
