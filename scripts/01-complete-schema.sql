-- RadiologyAI Database Schema
-- Complete schema with proper UUID handling and constraints

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (for clean setup)
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
    is_active BOOLEAN DEFAULT true
);

-- Radiology reports table
CREATE TABLE radiology_reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id VARCHAR(255) NOT NULL,
    study_type VARCHAR(255) NOT NULL,
    report_text TEXT NOT NULL,
    radiologist_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) CHECK (status IN ('pending', 'reviewed', 'approved', 'flagged')) DEFAULT 'pending'
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_reports_radiologist ON radiology_reports(radiologist_id);
CREATE INDEX idx_reports_status ON radiology_reports(status);
CREATE INDEX idx_reports_study_type ON radiology_reports(study_type);
CREATE INDEX idx_reports_created ON radiology_reports(created_at);
CREATE INDEX idx_analysis_report ON analysis_results(report_id);
CREATE INDEX idx_analysis_risk ON analysis_results(risk_level);
CREATE INDEX idx_analysis_confidence ON analysis_results(confidence);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON radiology_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analysis_updated_at BEFORE UPDATE ON analysis_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE radiology_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role to manage all data
CREATE POLICY "Service role full access users" ON users
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access reports" ON radiology_reports
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access analysis" ON analysis_results
    FOR ALL USING (auth.role() = 'service_role');

-- Public read access for authenticated users (adjust as needed)
CREATE POLICY "Authenticated users can read reports" ON radiology_reports
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read analysis" ON analysis_results
    FOR SELECT USING (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert completion message
DO $$
BEGIN
    RAISE NOTICE 'RadiologyAI database schema created successfully!';
    RAISE NOTICE 'Tables created: users, radiology_reports, analysis_results';
    RAISE NOTICE 'Indexes, triggers, and RLS policies configured';
END $$;
