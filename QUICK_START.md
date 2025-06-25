# WellnessAI Quick Start Guide

## Prerequisites

1. **Node.js 18+** installed
2. **LM Studio** installed from [lmstudio.ai](https://lmstudio.ai)
3. **Supabase account** (free tier works)
4. **Git** installed

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/vincenthopf/WholisticAI.git
cd WholisticAI/Wholistic

# Install dependencies
npm install
```

## Step 2: Setup LM Studio

1. Open LM Studio
2. Download the **OpenBioLLM-8B** model (or any medical/general model)
3. Start the local server:
   - Click on "Local Server" tab
   - Click "Start Server"
   - Default port should be 1234
   - Verify it's running at http://localhost:1234

## Step 3: Configure Environment

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` with your values:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE=your_service_role_key

# Security (Required)
CSRF_SECRET=generate_random_32_char_string
ENCRYPTION_KEY=generate_base64_encryption_key

# Medical Mode
ENABLE_MEDICAL_MODE=true
ENABLE_AUDIT_LOGGING=true

# LM Studio Configuration
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=OpenBioLLM-8B

# Optional: Other AI providers for Stage 2
OPENROUTER_API_KEY=your_openrouter_key_if_available
```

### Generate Security Keys

```bash
# Generate CSRF Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 4: Setup Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration scripts IN ORDER:

```bash
# First, run the base schema (creates users, chats, messages tables):
# supabase/migrations/000_base_schema.sql

# Then, run the medical tables:
# supabase/migrations/001_medical_tables.sql
```

**Important**: Run them in order!
1. Copy and paste the entire contents of `000_base_schema.sql` into the SQL editor and run it
2. Then copy and paste the entire contents of `001_medical_tables.sql` and run it

## Step 5: Configure Supabase Auth

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable **Email** provider (for basic auth)
3. Enable **Google** provider (optional)
4. Enable **Anonymous Sign-ins** for guest access

## Step 6: Start the Development Server

```bash
# Start the app
npm run dev
```

The app will be available at http://localhost:3000

## Step 7: First Time Setup

1. Open http://localhost:3000
2. You'll see the WellnessAI interface
3. Sign up or use anonymous login
4. Accept the medical disclaimer
5. Select "LM Studio (Local)" as your model
6. Start chatting!

## Testing Medical Features

### Quick Test Scenarios

1. **General Health Question**:
   ```
   "What are the benefits of regular exercise?"
   ```

2. **Symptom Check**:
   ```
   "I have a headache that started yesterday"
   ```

3. **Medication Information**:
   ```
   "Tell me about ibuprofen"
   ```

4. **Emergency Detection** (should trigger warning):
   ```
   "I have severe chest pain"
   ```

## Troubleshooting

### LM Studio Not Connecting

1. Check LM Studio is running: http://localhost:1234/v1/models
2. Verify the model is loaded in LM Studio
3. Check browser console for errors
4. Try the health check: http://localhost:3000/api/health/lm-studio

### Supabase Issues

1. Verify your Supabase URL and keys are correct
2. Check if tables were created: SQL Editor > "medical_conversations" table
3. Ensure RLS is enabled on tables
4. Check Supabase logs for errors

### Medical Features Not Showing

1. Ensure `ENABLE_MEDICAL_MODE=true` in `.env.local`
2. Clear browser cache and cookies
3. Re-accept the medical disclaimer
4. Check browser console for errors

## Development Tips

### Watch for Changes
```bash
# In separate terminal for TypeScript checking
npm run type-check -- --watch
```

### Check LM Studio Health
```bash
curl http://localhost:1234/v1/models
```

### Reset Database (if needed)
```sql
-- Run in Supabase SQL Editor to reset ALL tables
-- WARNING: This will delete all data!

-- Drop medical tables first (they have foreign key dependencies)
DROP TABLE IF EXISTS medical_conversations CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS medical_disclaimers CASCADE;
DROP TABLE IF EXISTS rate_limits CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS health_profiles CASCADE;
DROP TABLE IF EXISTS symptom_logs CASCADE;
DROP TABLE IF EXISTS medication_logs CASCADE;

-- Drop base tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_attachments CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS user_keys CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run both migrations in order:
-- 1. 000_base_schema.sql
-- 2. 001_medical_tables.sql
```

### Common Migration Errors

**"relation 'chats' does not exist"**
- You need to run `000_base_schema.sql` first
- This creates the base tables that medical tables reference

**"relation 'auth.users' does not exist"**
- Make sure Supabase Auth is enabled
- The auth schema should be created automatically by Supabase

**"permission denied to create extension"**
- Some Supabase plans may not allow certain extensions
- You can comment out the `CREATE EXTENSION vector;` line if needed

## Next Steps

1. **Test Stage 1**: Verify all basic medical chat features work
2. **Security Testing**: Try the rate limiting (10 requests/minute)
3. **Performance**: Check response times with LM Studio
4. **Medical Scenarios**: Test various health conversations

## Support

- Check `IMPLEMENTATION_STATUS.md` for detailed progress
- Review `MEDICAL_IMPLEMENTATION.md` for technical details
- See `TESTING_STRATEGY.md` for test scenarios

## Important Notes

⚠️ **Medical Disclaimer**: This is for educational/development purposes only. Not for real medical advice.

🔒 **Privacy**: In development, use test data only. Real health data requires proper security measures.

🚀 **Performance**: LM Studio should achieve 26+ tokens/second on modern hardware.