import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
}

// Different rate limits for different endpoints
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/chat': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: 'Too many medical consultation requests. Please wait before trying again.'
  },
  '/api/create-chat': {
    windowMs: 60 * 1000,
    maxRequests: 5,
    message: 'Too many chat creation requests. Please wait before trying again.'
  },
  '/api/health': {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Too many health check requests.'
  },
  default: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    message: 'Too many requests. Please slow down.'
  }
};

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Security headers configuration
const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openai.com https://api.anthropic.com https://api.mistral.ai https://openrouter.ai http://localhost:1234 http://localhost:11434",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
};

// Medical-specific security headers
const MEDICAL_SECURITY_HEADERS = {
  'X-Medical-Mode': 'true',
  'X-Privacy-Enhanced': 'true',
  'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  'Pragma': 'no-cache',
  'Expires': '0'
};

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Apply general security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Apply medical-specific headers
  if (process.env.ENABLE_MEDICAL_MODE === 'true') {
    Object.entries(MEDICAL_SECURITY_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Remove potentially revealing headers
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');

  return response;
}

/**
 * Rate limiting middleware
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  // Skip rate limiting in development
  if (process.env.NODE_ENV === 'development' && !process.env.FORCE_RATE_LIMIT) {
    return null;
  }

  // Get user identifier (IP + User-Agent for anonymous, user ID for authenticated)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userId = request.headers.get('x-user-id');
  
  const identifier = userId || createHash('md5')
    .update(ip + userAgent)
    .digest('hex');

  // Get rate limit config for this endpoint
  const rateLimitConfig = RATE_LIMITS[pathname] || RATE_LIMITS.default;
  const key = `${identifier}:${pathname}`;
  
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance to clean up
    cleanupExpiredEntries();
  }

  if (!record || now > record.resetTime) {
    // First request or window expired
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + rateLimitConfig.windowMs
    });
    return null;
  }

  if (record.count >= rateLimitConfig.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        message: rateLimitConfig.message,
        retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': rateLimitConfig.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString()
        }
      }
    );
  }

  // Increment counter
  record.count++;
  rateLimitStore.set(key, record);

  return null;
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  rateLimitStore.forEach((record, key) => {
    if (now > record.resetTime) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Session timeout middleware
 */
export async function sessionTimeoutMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  const sessionToken = request.cookies.get('session-token');
  
  if (!sessionToken) {
    return null;
  }

  const sessionExpiry = request.cookies.get('session-expiry');
  
  if (sessionExpiry && new Date(sessionExpiry.value) < new Date()) {
    // Session expired
    const response = NextResponse.json(
      {
        error: 'Session expired',
        message: 'Your session has expired. Please log in again.'
      },
      { status: 401 }
    );
    
    // Clear session cookies
    response.cookies.delete('session-token');
    response.cookies.delete('session-expiry');
    
    return response;
  }

  return null;
}

/**
 * Medical mode validation middleware
 */
export async function medicalModeMiddleware(
  request: NextRequest
): Promise<NextResponse | null> {
  if (process.env.ENABLE_MEDICAL_MODE !== 'true') {
    return null;
  }

  // Check if user has accepted medical disclaimer
  const disclaimerAccepted = request.cookies.get('medical-disclaimer-accepted');
  const userId = request.headers.get('x-user-id');
  
  if (!disclaimerAccepted && userId) {
    // Check if this is a medical endpoint that requires disclaimer
    const medicalEndpoints = ['/api/chat', '/api/medical'];
    const pathname = new URL(request.url).pathname;
    
    if (medicalEndpoints.some(endpoint => pathname.startsWith(endpoint))) {
      return NextResponse.json(
        {
          error: 'Medical disclaimer required',
          message: 'You must accept the medical disclaimer before using health features.',
          action: 'show_disclaimer'
        },
        { status: 403 }
      );
    }
  }

  return null;
}

/**
 * Audit logging helper
 */
export async function logAuditEvent(
  userId: string | null,
  action: string,
  resourceType: string,
  resourceId: string | null,
  request: NextRequest,
  metadata?: Record<string, any>
): Promise<void> {
  if (process.env.ENABLE_AUDIT_LOGGING !== 'true') {
    return;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // In production, this would write to Supabase
  // For now, we'll just log to console in development
  const auditEntry = {
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    ip_address: ip,
    user_agent: userAgent,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    }
  };

  // TODO: Implement Supabase audit logging
  console.log('[AUDIT]', JSON.stringify(auditEntry));
}

/**
 * Main security middleware
 */
export async function securityMiddleware(
  request: NextRequest
): Promise<NextResponse> {
  const pathname = new URL(request.url).pathname;

  // Apply rate limiting
  const rateLimitResponse = await rateLimitMiddleware(request, pathname);
  if (rateLimitResponse) {
    return applySecurityHeaders(rateLimitResponse);
  }

  // Check session timeout
  const sessionResponse = await sessionTimeoutMiddleware(request);
  if (sessionResponse) {
    return applySecurityHeaders(sessionResponse);
  }

  // Check medical mode requirements
  const medicalResponse = await medicalModeMiddleware(request);
  if (medicalResponse) {
    return applySecurityHeaders(medicalResponse);
  }

  // Continue with the request
  const response = NextResponse.next();
  return applySecurityHeaders(response);
}