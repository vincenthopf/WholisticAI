-- Medical-specific tables for WellnessAI
-- IMPORTANT: Run 000_base_schema.sql FIRST before running this migration
-- This migration depends on tables created in the base schema
-- This migration has been applied. 

-- Medical conversations metadata
CREATE TABLE IF NOT EXISTS medical_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversation_type TEXT CHECK (conversation_type IN ('general_consultation', 'symptom_check', 'medication_info', 'mental_health', 'pediatric_consultation', 'emergency_triage')),
  severity_level TEXT CHECK (severity_level IN ('low', 'medium', 'high', 'critical')),
  privacy_level TEXT DEFAULT 'high' CHECK (privacy_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logging for medical conversations
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical disclaimers acceptance
CREATE TABLE IF NOT EXISTS medical_disclaimers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  disclaimer_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  UNIQUE(user_id, disclaimer_version)
);

-- Rate limiting for medical endpoints
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint, window_start)
);

-- Emergency contact information (encrypted)
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Future tables for Stage 3: Medical history and health records
CREATE TABLE IF NOT EXISTS health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  iv TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Symptom tracking
CREATE TABLE IF NOT EXISTS symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symptom_type TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  description TEXT,
  triggers TEXT[],
  relief_methods TEXT[],
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication tracking
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all medical tables
ALTER TABLE medical_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_disclaimers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_conversations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own medical conversations' AND tablename = 'medical_conversations') THEN
    CREATE POLICY "Users can view own medical conversations" ON medical_conversations
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create own medical conversations' AND tablename = 'medical_conversations') THEN
    CREATE POLICY "Users can create own medical conversations" ON medical_conversations
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own medical conversations' AND tablename = 'medical_conversations') THEN
    CREATE POLICY "Users can update own medical conversations" ON medical_conversations
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for audit_logs (read-only for users)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own audit logs' AND tablename = 'audit_logs') THEN
    CREATE POLICY "Users can view own audit logs" ON audit_logs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- System can insert audit logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can create audit logs' AND tablename = 'audit_logs') THEN
    CREATE POLICY "System can create audit logs" ON audit_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- RLS Policies for medical_disclaimers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own disclaimers' AND tablename = 'medical_disclaimers') THEN
    CREATE POLICY "Users can view own disclaimers" ON medical_disclaimers
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can accept disclaimers' AND tablename = 'medical_disclaimers') THEN
    CREATE POLICY "Users can accept disclaimers" ON medical_disclaimers
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for emergency_contacts
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own emergency contacts' AND tablename = 'emergency_contacts') THEN
    CREATE POLICY "Users can manage own emergency contacts" ON emergency_contacts
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for health_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own health profile' AND tablename = 'health_profiles') THEN
    CREATE POLICY "Users can manage own health profile" ON health_profiles
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for symptom_logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own symptom logs' AND tablename = 'symptom_logs') THEN
    CREATE POLICY "Users can manage own symptom logs" ON symptom_logs
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for medication_logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own medication logs' AND tablename = 'medication_logs') THEN
    CREATE POLICY "Users can manage own medication logs" ON medication_logs
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_medical_conversations_user_id ON medical_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_conversations_chat_id ON medical_conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_medical_conversations_created_at ON medical_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_medical_conversations_type ON medical_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_medical_conversations_severity ON medical_conversations(severity_level);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_id ON symptom_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_logged_at ON symptom_logs(logged_at);
CREATE INDEX IF NOT EXISTS idx_symptom_logs_type ON symptom_logs(symptom_type);

CREATE INDEX IF NOT EXISTS idx_medication_logs_user_id ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_name ON medication_logs(medication_name);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_medical_conversations_updated_at ON medical_conversations;
CREATE TRIGGER update_medical_conversations_updated_at BEFORE UPDATE ON medical_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_emergency_contacts_updated_at ON emergency_contacts;
CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON health_profiles;
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON health_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medication_logs_updated_at ON medication_logs;
CREATE TRIGGER update_medication_logs_updated_at BEFORE UPDATE ON medication_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();