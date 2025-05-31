import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      
      // Check for waitUntil support
      hasWaitUntil: typeof (globalThis as any).waitUntil !== 'undefined',
      
      // Environment variables (safe ones only)
      env: {
        NODE_ENV: process.env.NODE_ENV,
        NODE_OPTIONS: process.env.NODE_OPTIONS,
        UV_THREADPOOL_SIZE: process.env.UV_THREADPOOL_SIZE,
        VERCEL: process.env.VERCEL,
        RAILWAY: process.env.RAILWAY,
        RENDER: process.env.RENDER,
        PORT: process.env.PORT,
        HOSTNAME: process.env.HOSTNAME,
      },
      
      // Docker/container detection
      isContainer: !!process.env.HOSTNAME && process.env.HOSTNAME !== 'localhost',
      
      // Request headers
      userAgent: request.headers.get('user-agent'),
      host: request.headers.get('host'),
      
      // Test background processing capability
      backgroundTest: await testBackgroundProcessing(),
    };

    return NextResponse.json(debugInfo, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug endpoint failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function testBackgroundProcessing(): Promise<any> {
  const startTime = Date.now();
  
  try {
    // Test a simple async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Test Promise.race behavior
    const raceResult = await Promise.race([
      new Promise(resolve => setTimeout(() => resolve('fast'), 50)),
      new Promise(resolve => setTimeout(() => resolve('slow'), 200))
    ]);
    
    return {
      success: true,
      duration: Date.now() - startTime,
      raceResult,
      setImmediateAvailable: typeof setImmediate !== 'undefined',
      processNextTickAvailable: typeof process.nextTick !== 'undefined',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
} 