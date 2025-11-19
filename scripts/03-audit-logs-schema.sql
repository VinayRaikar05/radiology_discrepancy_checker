-- Audit Logs Table
-- Tracks all user actions and system events for compliance and debugging

CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- Enable Row Level Security
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Service role can manage all audit logs
CREATE POLICY "Service role full access audit logs" ON audit_logs
    FOR ALL USING (auth.role() = 'service_role');

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

-- Grant permissions
GRANT ALL ON audit_logs TO postgres, service_role;
GRANT SELECT ON audit_logs TO authenticated;

-- Insert completion message
DO $$
BEGIN
    RAISE NOTICE 'Audit logs table created successfully!';
END $$;

