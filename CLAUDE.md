# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WellnessAI is a medical-focused AI chat platform forked from WholisticAI/Zola. It provides hybrid local/cloud AI capabilities with a privacy-first design for sensitive medical conversations.

**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS v4, Supabase, LM Studio for local AI

## Essential Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint

# Build & Production
npm run build            # Production build
npm run start            # Start production server

# Testing (Stage 1C pending implementation)
npm run test             # Run test suite
npm run test:health      # Check LM Studio connectivity
npm run test:lm-studio   # Verify LM Studio models

# Database
npx supabase gen types typescript > lib/database/types.ts  # Generate types
```

## Key Architecture Patterns

### Project Structure
- `/app` - Next.js App Router pages and API routes
- `/lib` - Core business logic, providers, and utilities
- `/components` - Reusable UI components (shadcn/ui based)
- `/supabase/migrations` - Database migrations (apply in order)

### Provider Architecture
The app uses a modular provider pattern:
- Each AI provider has its own implementation in `/lib/providers`
- Model definitions in `/lib/models/data`
- Dynamic model detection for LM Studio and Ollama
- Provider state management via Zustand stores

### Security Implementation
- CSRF protection on all state-changing requests
- Rate limiting (10 req/min default) on API routes
- Session management with 4-hour timeout
- Audit logging for medical conversations
- Security headers via helmet.js

### Medical Features
- Emergency detection with immediate 911 prompts
- Medical disclaimer system with version tracking
- Local-first approach for sensitive data
- Privacy abstraction layer for cloud services (Stage 2)

## Development Workflow

### Environment Setup
Critical environment variables:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE=
CSRF_SECRET=                    # 32 char random string
ENABLE_MEDICAL_MODE=true        # Enable medical features
LM_STUDIO_BASE_URL=http://localhost:1234/v1
```

### Database Migrations
Apply migrations in order:
1. `000_base_schema.sql` - Core tables
2. `001_medical_tables.sql` - Medical features

### Testing Strategy
Tests are organized by category in `/tests`:
- Security tests (headers, rate limiting)
- Medical conversation quality
- Integration tests (LM Studio, Supabase)
- Performance benchmarks (26+ tokens/sec required)

## Common Development Tasks

### Adding a New AI Provider
1. Create provider implementation in `/lib/providers/[provider-name].ts`
2. Add model definitions in `/lib/models/data/[provider].ts`
3. Update provider map in `/lib/providers/provider-map.ts`
4. Add API key to `.env` and `/lib/config.ts`

### Implementing Medical Features
1. All medical features must check `ENABLE_MEDICAL_MODE` flag
2. Include emergency detection for user messages
3. Ensure disclaimer acceptance before medical conversations
4. Log all medical interactions for audit trail

### Working with Streaming Responses
- Use Vercel AI SDK's streaming helpers
- Handle tool invocations in the stream
- Implement proper error boundaries for stream failures

## Performance Requirements
- Local AI response: <5 seconds
- Hybrid mode response: <10 seconds
- Support 10+ concurrent users
- Maintain 26+ tokens/second throughput

## Important Notes
- Always run type checking before committing
- Medical features require disclaimer acceptance
- Never commit sensitive keys or medical data
- Use LM Studio with OpenBioLLM-8B for medical conversations
- Privacy layer implementation is critical for Stage 2