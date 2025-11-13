-- RadiologyAI Seed Data
-- Comprehensive sample data with proper UUID casting

-- Insert demo users with proper UUID casting
INSERT INTO users (id, email, full_name, role, department, password_hash, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001'::uuid, 'admin@radiologyai.com', 'System Administrator', 'admin', 'IT', '$2a$10$example.hash.for.admin123', true),
('550e8400-e29b-41d4-a716-446655440002'::uuid, 'dr.smith@hospital.com', 'Dr. Sarah Smith', 'radiologist', 'Radiology', '$2a$10$example.hash.for.doctor123', true),
('550e8400-e29b-41d4-a716-446655440003'::uuid, 'dr.johnson@hospital.com', 'Dr. Michael Johnson', 'reviewer', 'Radiology', '$2a$10$example.hash.for.reviewer123', true),
('550e8400-e29b-41d4-a716-446655440004'::uuid, 'dr.wilson@hospital.com', 'Dr. Emily Wilson', 'radiologist', 'Radiology', '$2a$10$example.hash.for.password', true),
('550e8400-e29b-41d4-a716-446655440005'::uuid, 'resident.jones@hospital.com', 'Dr. James Jones', 'resident', 'Radiology', '$2a$10$example.hash.for.password', true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample radiology reports
INSERT INTO radiology_reports (id, patient_id, study_type, report_text, radiologist_id, status) VALUES
('660e8400-e29b-41d4-a716-446655440001'::uuid, 'PAT001', 'Chest X-Ray', 
'CLINICAL HISTORY: 45-year-old male with chest pain and shortness of breath.

TECHNIQUE: Frontal and lateral chest radiographs were obtained.

FINDINGS: The lungs are clear bilaterally with no evidence of consolidation, pleural effusion, or pneumothorax. The cardiac silhouette is normal in size and configuration. The mediastinal contours are unremarkable. No acute osseous abnormalities are identified.

IMPRESSION: Normal chest radiograph.', 
'550e8400-e29b-41d4-a716-446655440002'::uuid, 'pending'),

('660e8400-e29b-41d4-a716-446655440002'::uuid, 'PAT002', 'CT Head', 
'CLINICAL HISTORY: 62-year-old female with headache and confusion.

TECHNIQUE: Non-contrast CT scan of the head was performed.

FINDINGS: There is a small hypodense lesion in the right frontal lobe measuring approximately 1.2 cm. No mass effect or midline shift is present. The ventricular system is normal in size and configuration. No acute hemorrhage is identified.

IMPRESSION: Small hypodense lesion in right frontal lobe, likely representing a small infarct. Clinical correlation recommended.', 
'550e8400-e29b-41d4-a716-446655440004'::uuid, 'reviewed'),

('660e8400-e29b-41d4-a716-446655440003'::uuid, 'PAT003', 'Abdominal CT', 
'CLINICAL HISTORY: 38-year-old male with abdominal pain.

TECHNIQUE: Contrast-enhanced CT scan of the abdomen and pelvis.

FINDINGS: The liver, spleen, pancreas, and kidneys appear normal. There is mild wall thickening of the appendix with surrounding fat stranding. No free fluid or pneumoperitoneum is identified.

IMPRESSION: Findings consistent with acute appendicitis. Surgical consultation recommended.', 
'550e8400-e29b-41d4-a716-446655440002'::uuid, 'approved'),

('660e8400-e29b-41d4-a716-446655440004'::uuid, 'PAT004', 'Mammography', 
'CLINICAL HISTORY: 52-year-old female for routine screening mammography.

TECHNIQUE: Digital mammography with bilateral CC and MLO views.

FINDINGS: The breast tissue demonstrates heterogeneously dense parenchyma. There is a small spiculated mass in the upper outer quadrant of the left breast measuring 8mm. No suspicious calcifications are identified.

IMPRESSION: BI-RADS 4 - Suspicious finding in left breast. Recommend tissue sampling.', 
'550e8400-e29b-41d4-a716-446655440004'::uuid, 'flagged'),

('660e8400-e29b-41d4-a716-446655440005'::uuid, 'PAT005', 'Spine MRI', 
'CLINICAL HISTORY: 45-year-old male with lower back pain radiating to left leg.

TECHNIQUE: MRI of the lumbar spine without contrast.

FINDINGS: There is a large left paracentral disc herniation at L4-L5 with compression of the left L5 nerve root. Mild degenerative changes are present at multiple levels. The conus medullaris terminates normally at L1.

IMPRESSION: Large L4-L5 disc herniation with nerve root compression. Neurosurgical consultation recommended.', 
'550e8400-e29b-41d4-a716-446655440002'::uuid, 'pending')
ON CONFLICT (id) DO NOTHING;

-- Insert sample analysis results
INSERT INTO analysis_results (id, report_id, confidence, risk_level, findings, potential_false_findings, recommendations, summary, medical_relevance_score, discrepancies) VALUES
('770e8400-e29b-41d4-a716-446655440001'::uuid, '660e8400-e29b-41d4-a716-446655440001'::uuid, 0.9200, 'low', 
ARRAY['Normal chest radiograph', 'No acute findings', 'Clear lung fields'], 
'[{"finding": "Normal cardiac silhouette", "confidence": 0.95, "reasoning": "Standard interpretation, low risk of false finding"}]'::jsonb,
ARRAY['Continue routine follow-up', 'No immediate intervention required'], 
'Normal chest X-ray with no acute pathology identified. Low risk assessment.',
0.8500, '[]'::jsonb),

('770e8400-e29b-41d4-a716-446655440002'::uuid, '660e8400-e29b-41d4-a716-446655440002'::uuid, 0.7800, 'medium', 
ARRAY['Small hypodense lesion', 'Right frontal lobe location', 'No mass effect'], 
'[{"finding": "Small infarct vs artifact", "confidence": 0.65, "reasoning": "Small lesions can be difficult to differentiate from artifacts"}]'::jsonb,
ARRAY['Follow-up MRI recommended', 'Clinical correlation needed', 'Consider neurology consultation'], 
'Small frontal lobe lesion requires further evaluation to rule out false positive finding.',
0.7200, '[{"type": "size_measurement", "details": "Lesion size may be overestimated due to partial volume effects"}]'::jsonb),

('770e8400-e29b-41d4-a716-446655440003'::uuid, '660e8400-e29b-41d4-a716-446655440003'::uuid, 0.9500, 'high', 
ARRAY['Appendiceal wall thickening', 'Periappendiceal fat stranding', 'Clinical symptoms consistent'], 
'[{"finding": "Acute appendicitis", "confidence": 0.92, "reasoning": "Classic imaging findings with appropriate clinical context"}]'::jsonb,
ARRAY['Urgent surgical consultation', 'Pre-operative preparation', 'Monitor for complications'], 
'High confidence diagnosis of acute appendicitis with classic imaging findings.',
0.9300, '[]'::jsonb),

('770e8400-e29b-41d4-a716-446655440004'::uuid, '660e8400-e29b-41d4-a716-446655440004'::uuid, 0.8100, 'high', 
ARRAY['Spiculated breast mass', 'BI-RADS 4 classification', 'Requires tissue sampling'], 
'[{"finding": "Suspicious breast lesion", "confidence": 0.78, "reasoning": "Spiculated margins concerning but could represent radial scar"}]'::jsonb,
ARRAY['Tissue biopsy required', 'Multidisciplinary team discussion', 'Patient counseling needed'], 
'Suspicious breast finding requiring histological confirmation to exclude malignancy.',
0.8800, '[{"type": "differential_diagnosis", "details": "Consider radial scar vs invasive carcinoma"}]'::jsonb),

('770e8400-e29b-41d4-a716-446655440005'::uuid, '660e8400-e29b-41d4-a716-446655440005'::uuid, 0.9100, 'medium', 
ARRAY['L4-L5 disc herniation', 'Nerve root compression', 'Correlates with symptoms'], 
'[{"finding": "Disc herniation severity", "confidence": 0.85, "reasoning": "MRI findings consistent with clinical presentation"}]'::jsonb,
ARRAY['Neurosurgical evaluation', 'Conservative management trial', 'Physical therapy consideration'], 
'Significant disc herniation with nerve compression requiring specialist evaluation.',
0.8700, '[{"type": "treatment_options", "details": "Both conservative and surgical options should be considered"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Update statistics
ANALYZE users;
ANALYZE radiology_reports;
ANALYZE analysis_results;

-- Display completion message
DO $$
DECLARE
    user_count INTEGER;
    report_count INTEGER;
    analysis_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO report_count FROM radiology_reports;
    SELECT COUNT(*) INTO analysis_count FROM analysis_results;
    
    RAISE NOTICE 'RadiologyAI seed data inserted successfully!';
    RAISE NOTICE 'Users: % records', user_count;
    RAISE NOTICE 'Reports: % records', report_count;
    RAISE NOTICE 'Analysis Results: % records', analysis_count;
    RAISE NOTICE 'Database is ready for use!';
END $$;
