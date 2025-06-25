# Database Migration Guide

## Required Migrations

The application requires the following database migrations to be applied:

1. **000_base_schema.sql** - Base tables including users, chats, messages, etc.
2. **001_medical_tables.sql** - Medical-specific tables including medical_disclaimers

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Run migrations:
   ```bash
   supabase db push
   ```

### Option 2: Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of each migration file in order:
   - First: `supabase/migrations/000_base_schema.sql`
   - Second: `supabase/migrations/001_medical_tables.sql`
4. Execute each migration

### Option 3: Using Database Connection

If you have direct database access:
```bash
psql -h your-db-host -U postgres -d postgres < supabase/migrations/000_base_schema.sql
psql -h your-db-host -U postgres -d postgres < supabase/migrations/001_medical_tables.sql
```

## After Running Migrations

1. **Regenerate TypeScript Types**:
   ```bash
   npx supabase gen types typescript --project-id your-project-ref > app/types/database.types.ts
   ```

2. **Verify Tables Exist**:
   - Check that `medical_disclaimers` and other medical tables exist
   - You can verify in the Supabase Table Editor

## Troubleshooting

If you see errors like "relation 'medical_disclaimers' does not exist":
- The migrations haven't been applied
- Run the migrations following the steps above
- The app includes error handling to prevent crashes when tables are missing