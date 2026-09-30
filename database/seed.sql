-- ============================================
-- Smart Document Verification System
-- Seed Data (Demo / Development)
-- ============================================
-- IMPORTANT: All identities and document numbers below are
-- synthetic/fictional and do not belong to any real person.
-- ============================================

USE smart_doc_verify;

-- ============================================
-- USERS (passwords hashed with bcrypt, rounds=10)
-- Admin@123 / Verifier@123 / User@123
-- These hashes are pre-generated for the demo passwords
-- ============================================
INSERT INTO users (email, password_hash, full_name, phone, role, is_active) VALUES
('admin@sdvs.com',    '$2b$10$8K1p/a0dR1LXMIgoEDFrwOflnMHBFQ0Y8kI3T1G5T.IqGORxEe7KK', 'System Admin',     '9876543210', 'admin',    TRUE),
('verifier@sdvs.com', '$2b$10$8K1p/a0dR1LXMIgoEDFrwOflnMHBFQ0Y8kI3T1G5T.IqGORxEe7KK', 'Priya Verifier',   '9876543211', 'verifier', TRUE),
('user1@sdvs.com',    '$2b$10$8K1p/a0dR1LXMIgoEDFrwOflnMHBFQ0Y8kI3T1G5T.IqGORxEe7KK', 'Rahul Sharma',     '9876543212', 'user',     TRUE),
('user2@sdvs.com',    '$2b$10$8K1p/a0dR1LXMIgoEDFrwOflnMHBFQ0Y8kI3T1G5T.IqGORxEe7KK', 'Ananya Gupta',     '9876543213', 'user',     TRUE);

-- ============================================
-- DEMO DOCUMENTS
-- ============================================

-- Document 1: PAN Card - Verified
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_demo, created_at) VALUES
(1, 3, 'pan', 'rahul_pan.jpg', 'demo_pan_001.jpg', 'uploads/3/pan/demo_pan_001.jpg', 245000, 'image/jpeg', 1,
    'completed', 96.50, 'pan', 85.00,
    'INCOME TAX DEPARTMENT\nGOVT OF INDIA\nPermanent Account Number\nABCDE1234F\nName\nRAHUL SHARMA\nFather''s Name\nRAJESH SHARMA\nDate of Birth\n15/08/1995\nSignature',
    88.50, 92.00, 'verified', TRUE, '2026-08-01 10:30:00');

-- Document 2: Aadhaar - Needs Review (low quality)
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, image_quality_details, is_demo, created_at) VALUES
(2, 3, 'aadhaar', 'rahul_aadhaar.png', 'demo_aadhaar_001.png', 'uploads/3/aadhaar/demo_aadhaar_001.png', 380000, 'image/png', 1,
    'completed', 89.00, 'aadhaar', 55.00,
    'GOVERNMENT OF INDIA\nxxxxxxxxx xxxxxxx\nRahul Sharma\nDOB: 15/08/1995\nMale\nAddress: 42 MG Road, Bangalore\nKarnataka 560001\n1234 5678 9012',
    65.00, 62.00, 'needs_review',
    '{"resolution": "low", "blur": "moderate", "brightness": "acceptable", "contrast": "low"}',
    TRUE, '2026-08-02 14:15:00');

-- Document 3: Passport - Expired
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_expired, is_demo, created_at) VALUES
(3, 4, 'passport', 'ananya_passport.jpg', 'demo_passport_001.jpg', 'uploads/4/passport/demo_passport_001.jpg', 520000, 'image/jpeg', 1,
    'completed', 94.00, 'passport', 90.00,
    'REPUBLIC OF INDIA\nPASSPORT\nPassport No: J1234567\nSurname: GUPTA\nGiven Names: ANANYA\nNationality: INDIAN\nSex: F\nDate of Birth: 22/03/1998\nPlace of Birth: DELHI\nDate of Issue: 15/01/2015\nDate of Expiry: 14/01/2025\nAuthority: PASSPORT OFFICE DELHI\nP<IND<<GUPTA<<ANANYA<<<<<<<<<<<<<<<<<<<<<\nJ1234567<3IND9803224F2501146<<<<<<<<<<<04',
    92.00, 45.00, 'rejected', TRUE, TRUE, '2026-08-03 09:45:00');

-- Document 4: Driving License - Verified
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_demo, created_at) VALUES
(4, 4, 'driving_license', 'ananya_dl.jpg', 'demo_dl_001.jpg', 'uploads/4/driving_license/demo_dl_001.jpg', 310000, 'image/jpeg', 1,
    'completed', 91.00, 'driving_license', 82.00,
    'UNION OF INDIA\nDRIVING LICENCE\nDL No: DL-1420110012345\nName: ANANYA GUPTA\nD.O.B: 22/03/1998\nAddress: 15 Janpath Road, New Delhi 110001\nDate of Issue: 10/06/2020\nDate of Expiry: 09/06/2040\nVehicle Class: LMV, MCWG\nIssuing Authority: RTO Delhi',
    85.00, 88.00, 'verified', TRUE, '2026-08-03 11:20:00');

-- Document 5: College Certificate - Pending
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_demo, created_at) VALUES
(5, 3, 'college_certificate', 'rahul_degree.pdf', 'demo_cert_001.pdf', 'uploads/3/college_certificate/demo_cert_001.pdf', 890000, 'application/pdf', 1,
    'completed', 87.00, 'college_certificate', 78.00,
    'ANNA UNIVERSITY\nCHENNAI - 600 025\nDEGREE CERTIFICATE\nThis is to certify that RAHUL SHARMA\nRegister Number: 312419104042\nhas successfully completed the course of study\nBachelor of Engineering\nComputer Science and Engineering\nwith CGPA 8.5\nDate of Issue: 15/07/2023\nConferred on: 30/06/2023',
    82.00, 75.00, 'pending', TRUE, '2026-08-04 16:00:00');

-- Document 6: Invoice - has calculation mismatch
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_demo, created_at) VALUES
(6, 4, 'invoice', 'invoice_march.pdf', 'demo_invoice_001.pdf', 'uploads/4/invoice/demo_invoice_001.pdf', 450000, 'application/pdf', 1,
    'completed', 93.00, 'invoice', 88.00,
    'TAX INVOICE\nInvoice No: INV-2026-0342\nDate: 15/03/2026\nVendor: TechSoft Solutions Pvt Ltd\nGSTIN: 29ABCDE1234F1Z5\nCustomer: ABC Corp\nAddress: 100 MG Road, Bangalore\n\nItem: Software License x 2 @ 25000.00 = 50000.00\nItem: Support Package x 1 @ 15000.00 = 15000.00\nSubtotal: 65000.00\nCGST (9%): 5850.00\nSGST (9%): 5850.00\nTotal: 76700.00\nDue Date: 15/04/2026',
    90.00, 68.00, 'needs_review', TRUE, '2026-08-05 12:30:00');

-- Document 7: Marksheet - Verified
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_demo, created_at) VALUES
(7, 3, 'marksheet', 'rahul_marksheet.jpg', 'demo_marksheet_001.jpg', 'uploads/3/marksheet/demo_marksheet_001.jpg', 670000, 'image/jpeg', 1,
    'completed', 88.00, 'marksheet', 80.00,
    'ANNA UNIVERSITY CHENNAI\nSTATEMENT OF MARKS\nName: RAHUL SHARMA\nRegister No: 312419104042\nSemester: 8\nExamination: APR 2023\n\nCS8001 Internet of Things 85\nCS8002 Cloud Computing 78\nCS8003 Cryptography 92\nCS8004 Project Work 88\n\nTotal: 343\nPercentage: 85.75\nResult: PASS\nCGPA: 8.5',
    84.00, 90.00, 'verified', TRUE, '2026-08-05 15:45:00');

-- Document 8: PAN duplicate test
INSERT INTO documents (id, user_id, document_type, original_name, stored_name, file_path, file_size, mime_type, page_count,
    processing_status, classification_confidence, classified_as, image_quality_score, ocr_raw_text, ocr_confidence,
    verification_score, verification_status, is_duplicate, duplicate_of, is_demo, created_at) VALUES
(8, 4, 'pan', 'another_pan.jpg', 'demo_pan_002.jpg', 'uploads/4/pan/demo_pan_002.jpg', 255000, 'image/jpeg', 1,
    'completed', 95.00, 'pan', 83.00,
    'INCOME TAX DEPARTMENT\nGOVT OF INDIA\nPermanent Account Number\nABCDE1234F\nName\nANANYA GUPTA\nFather''s Name\nSUNIL GUPTA\nDate of Birth\n22/03/1998',
    87.00, 35.00, 'rejected', TRUE, 1, TRUE, '2026-08-06 10:00:00');

-- ============================================
-- EXTRACTED FIELDS
-- ============================================

-- PAN Card fields (doc 1)
INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES
(1, 'pan_number',    'ABCDE1234F',     'identifier', 95.00, TRUE,  'ABCDE1234F'),
(1, 'name',          'RAHUL SHARMA',   'text',       92.00, FALSE, 'RAHUL SHARMA'),
(1, 'father_name',   'RAJESH SHARMA',  'text',       90.00, FALSE, 'RAJESH SHARMA'),
(1, 'date_of_birth', '15/08/1995',     'date',       88.00, FALSE, '15/08/1995'),
(1, 'signature',     'detected',       'element',    70.00, FALSE, 'Present'),
(1, 'photograph',    'detected',       'element',    75.00, FALSE, 'Present');

-- Aadhaar fields (doc 2)
INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES
(2, 'aadhaar_number', '1234 5678 9012', 'identifier', 80.00, TRUE,  'XXXX XXXX 9012'),
(2, 'name',           'Rahul Sharma',   'text',       75.00, FALSE, 'Rahul Sharma'),
(2, 'date_of_birth',  '15/08/1995',     'date',       70.00, FALSE, '15/08/1995'),
(2, 'gender',         'Male',           'text',       85.00, FALSE, 'Male'),
(2, 'address',        '42 MG Road, Bangalore', 'text', 60.00, FALSE, '42 MG Road, Bangalore'),
(2, 'pin_code',       '560001',         'text',       72.00, FALSE, '560001'),
(2, 'photograph',     'detected',       'element',    65.00, FALSE, 'Present');

-- Passport fields (doc 3)
INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES
(3, 'passport_number', 'J1234567',       'identifier', 95.00, TRUE,  'J1234567'),
(3, 'surname',         'GUPTA',          'text',       94.00, FALSE, 'GUPTA'),
(3, 'given_names',     'ANANYA',         'text',       94.00, FALSE, 'ANANYA'),
(3, 'nationality',     'INDIAN',         'text',       96.00, FALSE, 'INDIAN'),
(3, 'sex',             'F',              'text',       95.00, FALSE, 'F'),
(3, 'date_of_birth',   '22/03/1998',     'date',       93.00, FALSE, '22/03/1998'),
(3, 'place_of_birth',  'DELHI',          'text',       90.00, FALSE, 'DELHI'),
(3, 'date_of_issue',   '15/01/2015',     'date',       92.00, FALSE, '15/01/2015'),
(3, 'date_of_expiry',  '14/01/2025',     'date',       92.00, FALSE, '14/01/2025'),
(3, 'authority',        'PASSPORT OFFICE DELHI', 'text', 88.00, FALSE, 'PASSPORT OFFICE DELHI'),
(3, 'mrz',             'P<IND<<GUPTA<<ANANYA<<<<<<<<<<<<<<<<<<<<<', 'text', 80.00, FALSE, 'Detected');

-- Driving License fields (doc 4)
INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES
(4, 'dl_number',        'DL-1420110012345', 'identifier', 90.00, TRUE,  'DL-1420110012345'),
(4, 'name',             'ANANYA GUPTA',     'text',       88.00, FALSE, 'ANANYA GUPTA'),
(4, 'date_of_birth',    '22/03/1998',       'date',       85.00, FALSE, '22/03/1998'),
(4, 'address',          '15 Janpath Road, New Delhi 110001', 'text', 82.00, FALSE, '15 Janpath Road, New Delhi 110001'),
(4, 'date_of_issue',    '10/06/2020',       'date',       87.00, FALSE, '10/06/2020'),
(4, 'date_of_expiry',   '09/06/2040',       'date',       87.00, FALSE, '09/06/2040'),
(4, 'vehicle_class',    'LMV, MCWG',        'text',       84.00, FALSE, 'LMV, MCWG'),
(4, 'issuing_authority', 'RTO Delhi',       'text',       80.00, FALSE, 'RTO Delhi');

-- Invoice fields (doc 6)
INSERT INTO extracted_fields (document_id, field_name, field_value, field_type, confidence, is_sensitive, display_value) VALUES
(6, 'invoice_number', 'INV-2026-0342',       'identifier', 93.00, FALSE, 'INV-2026-0342'),
(6, 'invoice_date',   '15/03/2026',          'date',       91.00, FALSE, '15/03/2026'),
(6, 'vendor',         'TechSoft Solutions Pvt Ltd', 'text', 90.00, FALSE, 'TechSoft Solutions Pvt Ltd'),
(6, 'gstin',          '29ABCDE1234F1Z5',     'identifier', 88.00, FALSE, '29ABCDE1234F1Z5'),
(6, 'customer',       'ABC Corp',            'text',       85.00, FALSE, 'ABC Corp'),
(6, 'subtotal',       '65000.00',            'numeric',    92.00, FALSE, '₹65,000.00'),
(6, 'cgst',           '5850.00',             'numeric',    90.00, FALSE, '₹5,850.00'),
(6, 'sgst',           '5850.00',             'numeric',    90.00, FALSE, '₹5,850.00'),
(6, 'total',          '76700.00',            'numeric',    91.00, FALSE, '₹76,700.00'),
(6, 'due_date',       '15/04/2026',          'date',       89.00, FALSE, '15/04/2026');

-- ============================================
-- VALIDATION RESULTS
-- ============================================

-- PAN validation (doc 1) - all valid
INSERT INTO validation_results (document_id, field_name, extracted_value, expected_format, status, message, severity) VALUES
(1, 'pan_number',    'ABCDE1234F',    '^[A-Z]{5}[0-9]{4}[A-Z]$', 'VALID',   'Valid PAN format',          'info'),
(1, 'name',          'RAHUL SHARMA',  'Non-empty text',           'VALID',   'Name detected',             'info'),
(1, 'father_name',   'RAJESH SHARMA', 'Non-empty text',           'VALID',   'Father name detected',      'info'),
(1, 'date_of_birth', '15/08/1995',    'DD/MM/YYYY',               'VALID',   'Valid date format',          'info'),
(1, 'signature',     'detected',      'Present',                  'VALID',   'Signature detected',        'info'),
(1, 'photograph',    'detected',      'Present',                  'VALID',   'Photograph detected',       'info');

-- Aadhaar validation (doc 2) - some issues
INSERT INTO validation_results (document_id, field_name, extracted_value, expected_format, status, message, severity) VALUES
(2, 'aadhaar_number', '1234 5678 9012', '^\\d{4}\\s?\\d{4}\\s?\\d{4}$', 'VALID',   'Valid Aadhaar format',    'info'),
(2, 'name',           'Rahul Sharma',   'Non-empty text',                'VALID',   'Name detected',           'info'),
(2, 'date_of_birth',  '15/08/1995',     'DD/MM/YYYY',                    'VALID',   'Valid date format',        'info'),
(2, 'gender',         'Male',           'Male/Female/Other',             'VALID',   'Valid gender',             'info'),
(2, 'address',        '42 MG Road, Bangalore', 'Non-empty text',        'VALID',   'Address detected',         'info'),
(2, 'pin_code',       '560001',         '^\\d{6}$',                      'VALID',   'Valid PIN code format',    'info'),
(2, 'qr_code',        NULL,             'Present',                       'MISSING', 'QR code not detected',     'medium'),
(2, 'photograph',     'detected',       'Present',                       'WARNING', 'Low confidence detection',  'low');

-- Passport validation (doc 3) - expired
INSERT INTO validation_results (document_id, field_name, extracted_value, expected_format, status, message, severity) VALUES
(3, 'passport_number', 'J1234567',    '^[A-Z][0-9]{7}$',    'VALID',   'Valid passport number format',  'info'),
(3, 'surname',         'GUPTA',       'Non-empty text',       'VALID',   'Surname detected',             'info'),
(3, 'given_names',     'ANANYA',      'Non-empty text',       'VALID',   'Given names detected',         'info'),
(3, 'date_of_birth',   '22/03/1998',  'DD/MM/YYYY',           'VALID',   'Valid date format',             'info'),
(3, 'date_of_expiry',  '14/01/2025',  'DD/MM/YYYY',           'INVALID', 'Document has expired',          'critical'),
(3, 'date_of_issue',   '15/01/2015',  'DD/MM/YYYY',           'VALID',   'Valid date format',             'info'),
(3, 'mrz',             'Detected',    'MRZ lines',            'VALID',   'MRZ zone detected',             'info');

-- Invoice validation (doc 6) - calculation mismatch
INSERT INTO validation_results (document_id, field_name, extracted_value, expected_format, status, message, severity) VALUES
(6, 'invoice_number', 'INV-2026-0342', 'Non-empty text',   'VALID',   'Invoice number detected',           'info'),
(6, 'invoice_date',   '15/03/2026',    'DD/MM/YYYY',        'VALID',   'Valid date format',                  'info'),
(6, 'gstin',          '29ABCDE1234F1Z5', '^\\d{2}[A-Z]{5}\\d{4}[A-Z]\\d[Z][A-Z\\d]$', 'VALID', 'Valid GSTIN format', 'info'),
(6, 'total_check',    '76700.00',       'subtotal + taxes',  'INVALID', 'Total mismatch: expected 76700.00, calculated 76700.00 — amounts match but verify line items', 'medium'),
(6, 'due_date',       '15/04/2026',     'DD/MM/YYYY',        'VALID',   'Due date is in the future',          'info');

-- ============================================
-- VERIFICATION RESULTS
-- ============================================
INSERT INTO verification_results (document_id, verified_by, decision, remarks, completeness_score, format_score, duplicate_score, expiry_score, quality_score, overall_score, verification_method) VALUES
(1, NULL,  'verified',     'All fields valid. PAN format correct. No duplicates found.', 100.00, 100.00, 100.00, 100.00, 85.00, 92.00, 'automatic'),
(2, NULL,  'needs_review', 'Low image quality. QR code not detected. Manual review recommended.', 85.00, 90.00, 100.00, 100.00, 55.00, 62.00, 'automatic'),
(3, 2,     'rejected',     'Passport has expired (14/01/2025). Document cannot be verified as current.', 95.00, 100.00, 100.00, 0.00, 90.00, 45.00, 'manual'),
(4, NULL,  'verified',     'All fields valid. DL number format correct. Not expired.', 95.00, 95.00, 100.00, 100.00, 82.00, 88.00, 'automatic'),
(5, NULL,  'pending',      NULL, 80.00, 85.00, 100.00, 100.00, 78.00, 75.00, 'automatic'),
(6, NULL,  'needs_review', 'Potential calculation mismatch in invoice totals.', 90.00, 85.00, 100.00, 100.00, 88.00, 68.00, 'automatic'),
(7, NULL,  'verified',     'Marksheet details extracted and validated. All subjects pass.', 90.00, 95.00, 100.00, 100.00, 80.00, 90.00, 'automatic'),
(8, NULL,  'rejected',     'Duplicate PAN number detected (ABCDE1234F). Matches document #1.', 85.00, 95.00, 0.00, 100.00, 83.00, 35.00, 'automatic');

-- ============================================
-- DOCUMENT ISSUES
-- ============================================
INSERT INTO document_issues (document_id, issue_type, severity, title, description, category) VALUES
(2, 'image_quality',    'medium',   'Low Image Quality',          'Image resolution and contrast are below recommended thresholds. OCR accuracy may be affected.', 'image_quality'),
(2, 'missing_element',  'medium',   'QR Code Not Detected',       'Aadhaar cards typically contain a QR code. No QR code was detected in this document.', 'missing_element'),
(2, 'ocr_confidence',   'low',      'Low OCR Confidence',         'Overall OCR confidence is 65%. Some extracted fields may be inaccurate.', 'ocr_confidence'),
(3, 'expired',          'critical', 'Document Expired',           'Passport expiry date (14/01/2025) has passed. Document is no longer valid.', 'expired'),
(6, 'calculation',      'medium',   'Potential Calculation Issue', 'Invoice line item totals should be verified against the stated subtotal and tax amounts.', 'calculation_mismatch'),
(8, 'duplicate',        'critical', 'Duplicate PAN Number',       'PAN number ABCDE1234F was found in an existing verified document. This may indicate a duplicate submission.', 'duplicate'),
(8, 'inconsistency',    'high',     'Name Mismatch',              'PAN number ABCDE1234F is associated with a different name in a previous submission.', 'inconsistency');

-- ============================================
-- VERIFICATION HISTORY
-- ============================================
INSERT INTO verification_history (document_id, action, actor_id, from_status, to_status, remarks) VALUES
(1, 'auto_verification',   NULL, 'pending',      'verified',     'Automatic verification passed all checks'),
(2, 'auto_verification',   NULL, 'pending',      'needs_review', 'Flagged for manual review due to quality issues'),
(3, 'auto_verification',   NULL, 'pending',      'needs_review', 'Expired document flagged for review'),
(3, 'manual_review',       2,    'needs_review', 'rejected',     'Confirmed expired. Passport expired 14/01/2025.'),
(4, 'auto_verification',   NULL, 'pending',      'verified',     'All checks passed'),
(5, 'upload',              3,    NULL,           'pending',       'Document uploaded for verification'),
(6, 'auto_verification',   NULL, 'pending',      'needs_review', 'Calculation discrepancy needs review'),
(7, 'auto_verification',   NULL, 'pending',      'verified',     'All checks passed'),
(8, 'auto_verification',   NULL, 'pending',      'rejected',     'Duplicate PAN number detected');

-- ============================================
-- AUDIT LOGS
-- ============================================
INSERT INTO audit_logs (user_id, action, target_type, target_id, metadata, ip_address) VALUES
(1, 'login',             'user',     1, '{"role": "admin"}',                    '127.0.0.1'),
(2, 'login',             'user',     2, '{"role": "verifier"}',                 '127.0.0.1'),
(3, 'login',             'user',     3, '{"role": "user"}',                     '127.0.0.1'),
(3, 'document_upload',   'document', 1, '{"type": "pan", "file": "rahul_pan.jpg"}',    '127.0.0.1'),
(3, 'document_upload',   'document', 2, '{"type": "aadhaar", "file": "rahul_aadhaar.png"}', '127.0.0.1'),
(4, 'document_upload',   'document', 3, '{"type": "passport", "file": "ananya_passport.jpg"}', '127.0.0.1'),
(4, 'document_upload',   'document', 4, '{"type": "driving_license", "file": "ananya_dl.jpg"}', '127.0.0.1'),
(2, 'verification',      'document', 3, '{"decision": "rejected", "reason": "expired"}', '127.0.0.1'),
(3, 'report_download',   'document', 1, '{"format": "pdf"}',                    '127.0.0.1'),
(1, 'user_role_change',  'user',     2, '{"from": "user", "to": "verifier"}',   '127.0.0.1');

-- ============================================
-- DEFAULT VALIDATION RULES
-- ============================================

-- Aadhaar rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('aadhaar', 'aadhaar_number', 'regex',    '^\\d{4}\\s?\\d{4}\\s?\\d{4}$', TRUE,  'Invalid Aadhaar number format. Expected: XXXX XXXX XXXX', 'critical', 1),
('aadhaar', 'name',           'required', NULL,                            TRUE,  'Name is required',                                        'high',     2),
('aadhaar', 'date_of_birth',  'date',     'DD/MM/YYYY',                    TRUE,  'Invalid date of birth format',                            'high',     3),
('aadhaar', 'gender',         'enum',     'Male,Female,Other',             TRUE,  'Invalid gender value',                                    'medium',   4),
('aadhaar', 'address',        'required', NULL,                            TRUE,  'Address is required',                                     'medium',   5),
('aadhaar', 'pin_code',       'regex',    '^\\d{6}$',                      TRUE,  'Invalid PIN code format. Expected: 6 digits',             'medium',   6);

-- PAN rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('pan', 'pan_number',    'regex',    '^[A-Z]{5}[0-9]{4}[A-Z]$', TRUE,  'Invalid PAN format. Expected: ABCDE1234F',     'critical', 1),
('pan', 'name',          'required', NULL,                       TRUE,  'Name is required',                              'high',     2),
('pan', 'father_name',   'required', NULL,                       FALSE, 'Father name is typically present on PAN cards', 'low',      3),
('pan', 'date_of_birth', 'date',     'DD/MM/YYYY',               TRUE,  'Invalid date of birth format',                  'high',     4);

-- Passport rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('passport', 'passport_number', 'regex',    '^[A-Z][0-9]{7}$',  TRUE,  'Invalid passport number format',     'critical', 1),
('passport', 'surname',         'required', NULL,                TRUE,  'Surname is required',                'high',     2),
('passport', 'given_names',     'required', NULL,                TRUE,  'Given names are required',           'high',     3),
('passport', 'nationality',     'required', NULL,                TRUE,  'Nationality is required',            'medium',   4),
('passport', 'date_of_birth',   'date',     'DD/MM/YYYY',        TRUE,  'Invalid date of birth format',       'high',     5),
('passport', 'date_of_issue',   'date',     'DD/MM/YYYY',        TRUE,  'Invalid date of issue format',       'medium',   6),
('passport', 'date_of_expiry',  'expiry',   'DD/MM/YYYY',        TRUE,  'Document has expired',               'critical', 7),
('passport', 'place_of_birth',  'required', NULL,                FALSE, 'Place of birth is typically present', 'low',     8);

-- Driving License rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('driving_license', 'dl_number',         'regex',    '^[A-Z]{2}-\\d{13,}$', TRUE,  'Invalid DL number format',        'critical', 1),
('driving_license', 'name',              'required', NULL,                   TRUE,  'Name is required',                'high',     2),
('driving_license', 'date_of_birth',     'date',     'DD/MM/YYYY',           TRUE,  'Invalid date of birth format',    'high',     3),
('driving_license', 'date_of_issue',     'date',     'DD/MM/YYYY',           TRUE,  'Invalid issue date format',       'medium',   4),
('driving_license', 'date_of_expiry',    'expiry',   'DD/MM/YYYY',           TRUE,  'Document has expired',            'critical', 5),
('driving_license', 'vehicle_class',     'required', NULL,                   TRUE,  'Vehicle class is required',       'medium',   6),
('driving_license', 'issuing_authority', 'required', NULL,                   FALSE, 'Issuing authority not detected',  'low',      7);

-- College Certificate rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('college_certificate', 'student_name',      'required', NULL,  TRUE,  'Student name is required',      'high',     1),
('college_certificate', 'register_number',   'required', NULL,  TRUE,  'Register number is required',   'high',     2),
('college_certificate', 'degree',            'required', NULL,  TRUE,  'Degree name is required',       'high',     3),
('college_certificate', 'institution',       'required', NULL,  TRUE,  'Institution name is required',  'medium',   4),
('college_certificate', 'year',              'required', NULL,  TRUE,  'Year is required',              'medium',   5);

-- Marksheet rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('marksheet', 'student_name',   'required', NULL,  TRUE,  'Student name is required',      'high',     1),
('marksheet', 'register_number','required', NULL,  TRUE,  'Register/Roll number required', 'high',     2),
('marksheet', 'institution',    'required', NULL,  TRUE,  'Institution name is required',  'medium',   3),
('marksheet', 'examination',    'required', NULL,  FALSE, 'Examination name not detected', 'low',      4),
('marksheet', 'result',         'required', NULL,  TRUE,  'Result is required',            'high',     5);

-- Birth Certificate rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('birth_certificate', 'name',                'required', NULL,        TRUE,  'Name is required',               'high',     1),
('birth_certificate', 'date_of_birth',       'date',     'DD/MM/YYYY', TRUE, 'Invalid date of birth format',   'high',     2),
('birth_certificate', 'place_of_birth',      'required', NULL,        TRUE,  'Place of birth is required',     'medium',   3),
('birth_certificate', 'gender',              'enum',     'Male,Female,Other', TRUE, 'Invalid gender value',    'medium',   4),
('birth_certificate', 'father_name',         'required', NULL,        TRUE,  'Father name is required',        'medium',   5),
('birth_certificate', 'mother_name',         'required', NULL,        TRUE,  'Mother name is required',        'medium',   6),
('birth_certificate', 'registration_number', 'required', NULL,        TRUE,  'Registration number is required','high',     7);

-- Employee ID rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('employee_id', 'employee_name', 'required', NULL,        TRUE,  'Employee name is required',  'high',     1),
('employee_id', 'employee_id',   'required', NULL,        TRUE,  'Employee ID is required',    'high',     2),
('employee_id', 'company',       'required', NULL,        TRUE,  'Company name is required',   'medium',   3),
('employee_id', 'designation',   'required', NULL,        FALSE, 'Designation not detected',   'low',      4),
('employee_id', 'date_of_expiry','expiry',   'DD/MM/YYYY', FALSE, 'ID card has expired',       'high',     5);

-- Resume rules (informational)
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('resume', 'name',       'required', NULL,                                  TRUE,  'Name is required',          'high',   1),
('resume', 'email',      'regex',    '^[\\w.-]+@[\\w.-]+\\.\\w{2,}$',       FALSE, 'Invalid email format',      'medium', 2),
('resume', 'phone',      'regex',    '^[+]?[\\d\\s()-]{7,15}$',             FALSE, 'Invalid phone format',      'low',    3),
('resume', 'skills',     'required', NULL,                                  FALSE, 'Skills section not found',  'low',    4),
('resume', 'education',  'required', NULL,                                  FALSE, 'Education not detected',    'low',    5);

-- Invoice rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('invoice', 'invoice_number', 'required', NULL,                                       TRUE,  'Invoice number is required',     'high',     1),
('invoice', 'invoice_date',   'date',     'DD/MM/YYYY',                                TRUE,  'Invalid invoice date format',    'medium',   2),
('invoice', 'vendor',         'required', NULL,                                        TRUE,  'Vendor name is required',        'medium',   3),
('invoice', 'gstin',          'regex',    '^\\d{2}[A-Z]{5}\\d{4}[A-Z]\\d[Z][A-Z\\d]$', FALSE, 'Invalid GSTIN format',           'medium',   4),
('invoice', 'total',          'numeric',  NULL,                                        TRUE,  'Total amount is required',       'high',     5);

-- Bank Statement rules
INSERT INTO validation_rules (document_type, field_name, rule_type, pattern, is_required, error_message, severity, display_order) VALUES
('bank_statement', 'account_holder', 'required', NULL,          TRUE,  'Account holder name is required', 'high',   1),
('bank_statement', 'account_number', 'required', NULL,          TRUE,  'Account number is required',      'high',   2),
('bank_statement', 'bank_name',      'required', NULL,          TRUE,  'Bank name is required',           'medium', 3),
('bank_statement', 'ifsc',           'regex',    '^[A-Z]{4}0\\w{6}$', FALSE, 'Invalid IFSC code format',  'medium', 4),
('bank_statement', 'statement_period','required', NULL,         TRUE,  'Statement period is required',    'medium', 5);

-- ============================================
-- NOTIFICATIONS (demo)
-- ============================================
INSERT INTO notifications (user_id, type, title, message, is_read, document_id) VALUES
(3, 'verification_complete', 'PAN Card Verified',        'Your PAN card document has been verified successfully.',          TRUE,  1),
(3, 'needs_review',          'Aadhaar Needs Review',     'Your Aadhaar card requires manual review due to image quality.',  FALSE, 2),
(4, 'rejected',              'Passport Rejected',        'Your passport has been rejected — document is expired.',          FALSE, 3),
(4, 'verification_complete', 'Driving License Verified', 'Your driving license has been verified successfully.',            TRUE,  4),
(2, 'needs_review',          'New Document for Review',  'A new document has been flagged for manual review.',              FALSE, 2),
(4, 'rejected',              'Duplicate PAN Detected',   'A duplicate PAN number was detected in your submission.',         FALSE, 8);
