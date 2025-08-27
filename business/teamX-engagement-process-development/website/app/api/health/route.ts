import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - could be extended to check database, external services, etc.
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }

    return NextResponse.json(errorData, { status: 503 })
  }
}