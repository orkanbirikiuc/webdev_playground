import { NextResponse } from 'next/server'

export async function GET() {
  // Simulate real metrics
  const metrics = {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  }
  
  return NextResponse.json(metrics)
}
