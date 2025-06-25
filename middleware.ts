import { updateSession } from "@/utils/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"
import { validateCsrfToken } from "./lib/csrf"
import { 
  securityMiddleware, 
  rateLimitMiddleware, 
  sessionTimeoutMiddleware,
  medicalModeMiddleware,
  applySecurityHeaders,
  logAuditEvent 
} from "./middleware/security"

export async function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  
  // Apply security middleware first (includes rate limiting, session timeout, etc.)
  const securityResponse = await securityMiddleware(request);
  if (securityResponse.status !== 200) {
    return securityResponse;
  }

  // Update Supabase session
  const response = await updateSession(request)

  // CSRF protection for state-changing requests
  if (["POST", "PUT", "DELETE"].includes(request.method)) {
    const csrfCookie = request.cookies.get("csrf_token")?.value
    const headerToken = request.headers.get("x-csrf-token")

    if (!csrfCookie || !headerToken || !validateCsrfToken(headerToken)) {
      // Log CSRF failure for security monitoring
      await logAuditEvent(
        request.headers.get('x-user-id'),
        'csrf_validation_failed',
        'request',
        pathname,
        request,
        { method: request.method }
      );
      
      return new NextResponse("Invalid CSRF token", { status: 403 })
    }
  }

  // Apply all security headers to the response
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
  runtime: "nodejs",
}
