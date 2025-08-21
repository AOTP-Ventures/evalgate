import { NextResponse } from 'next/server';
import { getAvailableVersions, getLatestVersion } from '@/lib/navigation';

export async function GET() {
  try {
    const versions = getAvailableVersions();
    const latest = getLatestVersion();
    
    return NextResponse.json({
      versions,
      latest
    });
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
