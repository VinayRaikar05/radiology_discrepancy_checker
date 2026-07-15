-- Run this in the Supabase SQL Editor to update your database schema
ALTER TABLE radiology_reports ADD COLUMN IF NOT EXISTS previous_report_id UUID REFERENCES radiology_reports(id) ON DELETE SET NULL;
