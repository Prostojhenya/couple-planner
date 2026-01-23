import { NextResponse } from 'next/server';

export async function GET() {
  const status = {
    firebaseConfigured: false,
    missingVars: [] as string[],
    timestamp: new Date().toISOString()
  };

  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_CERT_URL'
  ];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      status.missingVars.push(varName);
    }
  }

  status.firebaseConfigured = status.missingVars.length === 0;

  return NextResponse.json(status);
}
