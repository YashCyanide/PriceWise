import { NextResponse } from 'next/server';
import { startCronJobs } from '@/lib/cron/scheduler';

let cronInitialized = false;

export async function GET() {
  if (!cronInitialized && process.env.NODE_ENV === 'development') {
    startCronJobs();
    cronInitialized = true;
    return NextResponse.json({ message: 'Cron jobs initialized' });
  }
  
  return NextResponse.json({ message: 'Cron jobs already running' });
}
