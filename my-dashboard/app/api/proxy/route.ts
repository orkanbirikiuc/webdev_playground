import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('http://10.142.69.31:8080/metrics');
  const data = await res.json();
  return NextResponse.json(data);
}