-- RadiologyAI Database Schema v2
-- Enhanced schema with patient demographics, soft-delete, comments, and full-text search

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS report_comments CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS analysis_results CASCADE;
DROP TABLE IF EXISTS radiology_reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'radiologist', 'reviewer', 'resident')) NOT NULL,
    department VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Radiology reports table (enhanced with patient demographics)
CREATE TABLE radiology_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    patient_name VARCHAR(255),
    referring_physician VARCHAR(255),
    clinical_indication TEXT,
    study_type VARCHAR(255) NOT NULL,
    report_text TEXT NOT NULL,
    radiologist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) CHECK (status IN ('pending', 'reviewed', 'approved', 'flagged')) DEFAULT 'pending',
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    previous_report_id UUID REFERENCES radiology_reports(id) ON DELETE SET NULL
);

-- Analysis results table
CREATE TABLE analysis_results (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES radiology_reports(id) ON DELETE CASCADE,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    risk_level VARCHAR(50) CHECK (risk_level IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    findings TEXT[] NOT NULL DEFAULT '{}',
    potential_false_findings JSONB DEFAULT '[]'::jsonb,
    recommendations TEXT[] NOT NULL DEFAULT '{}',
    summary TEXT NOT NULL,
    medical_relevance_score DECIMAL(5,4) NOT NULL CHECK (medical_relevance_score >= 0 AND medical_relevance_score <= 1),
    discrepancies JSONB DEFAULT '[]'::jsonb,
    analysis_type VARCHAR(100) DEFAULT 'text_analysis',
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report comments table (for reviewer annotations)
CREATE TABLE report_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    report_id UUID REFERENCES radiology_reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    comment_type VARCHAR(50) CHECK (comment_type IN ('note', 'correction', 'agreement', 'question')) DEFAULT 'note',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────────────────────

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;

-- Reports
CREATE INDEX idx_reports_radiologist ON radiology_reports(radiologist_id);
CREATE INDEX idx_reports_status ON radiology_reports(status);
CREATE INDEX idx_reports_study_type ON radiology_reports(study_type);
CREATE INDEX idx_reports_created ON radiology_reports(created_at DESC);
CREATE INDEX idx_reports_patient ON radiology_reports(patient_id);
CREATE INDEX idx_reports_not_deleted ON radiology_reports(id) WHERE deleted_at IS NULL;

-- Full-text search index on report text
CREATE INDEX idx_reports_text_search ON radiology_reports
    USING GIN (to_tsvector('english', report_text));

-- Analysis
CREATE INDEX idx_analysis_report ON analysis_results(report_id);
CREATE INDEX idx_analysis_risk ON analysis_results(risk_level);
CREATE INDEX idx_analysis_confidence ON analysis_results(confidence);

-- Comments
CREATE INDEX idx_comments_report ON report_comments(report_id);
CREATE INDEX idx_comments_user ON report_comments(user_id);

-- Audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ── Triggers ───────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON radiology_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_updated_at BEFORE UPDATE ON analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON report_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ─────────────────────────────────────────────────────

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access reports" ON radiology_reports
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analysis" ON analysis_results
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access comments" ON report_comments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access audit logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Authenticated users can read reports and analysis
CREATE POLICY "Authenticated users can read reports" ON radiology_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read analysis" ON analysis_results
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read comments" ON report_comments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Admins can read audit logs
CREATE POLICY "Admins can read audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id::text = auth.uid()::text
            AND users.role = 'admin'
        )
    );

-- Users can read their own audit logs
CREATE POLICY "Users can read own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- ── Permissions ────────────────────────────────────────────────────────────

GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ── Success message ────────────────────────────────────────────────────────

DO $$
BEGIN
    RAISE NOTICE 'RadiologyAI database schema v2 created successfully!';
    RAISE NOTICE 'Tables created: users, radiology_reports, analysis_results, report_comments, audit_logs';
    RAISE NOTICE 'Full-text search index configured on radiology_reports.report_text';
    RAISE NOTICE 'Indexes, triggers, and RLS policies configured';
END $