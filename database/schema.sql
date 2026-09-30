-- ============================================
-- Smart Document Verification System
-- MySQL Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS smart_doc_verify;
USE smart_doc_verify;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    avatar_url TEXT DEFAULT NULL,
    role ENUM('user', 'verifier', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    document_type ENUM(
        'aadhaar', 'pan', 'passport', 'driving_license',
        'college_certificate', 'marksheet', 'birth_certificate',
        'employee_id', 'resume', 'invoice', 'bank_statement', 'unknown'
    ) DEFAULT 'unknown',
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT NULL,
    page_count INT DEFAULT 1,
    
    -- Processing status
    processing_status ENUM('queued', 'uploading', 'preprocessing', 'ocr_processing', 
        'classifying', 'extracting', 'validating', 'scoring', 'completed', 'failed') DEFAULT 'queued',
    processing_error TEXT DEFAULT NULL,
    processing_started_at DATETIME DEFAULT NULL,
    processing_completed_at DATETIME DEFAULT NULL,
    
    -- Classification
    classification_confidence DECIMAL(5,2) DEFAULT 0,
    classified_as VARCHAR(50) DEFAULT NULL,
    
    -- Image quality
    image_quality_score DECIMAL(5,2) DEFAULT 0,
    image_quality_details JSON DEFAULT NULL,
    
    -- OCR
    ocr_raw_text LONGTEXT DEFAULT NULL,
    ocr_confidence DECIMAL(5,2) DEFAULT 0,
    ocr_engine VARCHAR(50) DEFAULT 'tesseract',
    
    -- Verification
    verification_score DECIMAL(5,2) DEFAULT 0,
    verification_status ENUM('pending', 'processing', 'verified', 'needs_review', 'rejected', 'error') DEFAULT 'pending',
    verification_decision_at DATETIME DEFAULT NULL,
    
    -- Tampering
    tampering_indicators JSON DEFAULT NULL,
    tampering_risk ENUM('none', 'low', 'medium', 'high') DEFAULT 'none',
    
    -- QR/Barcode
    qr_detected BOOLEAN DEFAULT FALSE,
    qr_data TEXT DEFAULT NULL,
    barcode_detected BOOLEAN DEFAULT FALSE,
    barcode_data TEXT DEFAULT NULL,
    
    -- Flags
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of INT DEFAULT NULL,
    is_expired BOOLEAN DEFAULT FALSE,
    is_demo BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (duplicate_of) REFERENCES documents(id) ON DELETE SET NULL,
    INDEX idx_docs_user (user_id),
    INDEX idx_docs_type (document_type),
    INDEX idx_docs_status (verification_status),
    INDEX idx_docs_processing (processing_status),
    INDEX idx_docs_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. DOCUMENT FILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('original', 'preprocessed', 'thumbnail', 'report') DEFAULT 'original',
    file_size BIGINT DEFAULT 0,
    mime_type VARCHAR(100) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_docfiles_doc (document_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. EXTRACTED FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS extracted_fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    field_value TEXT DEFAULT NULL,
    field_type VARCHAR(50) DEFAULT 'text',
    confidence DECIMAL(5,2) DEFAULT 0,
    is_sensitive BOOLEAN DEFAULT FALSE,
    display_value TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_fields_doc (document_id),
    INDEX idx_fields_name (field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. VALIDATION RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS validation_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    extracted_value TEXT DEFAULT NULL,
    expected_format VARCHAR(255) DEFAULT NULL,
    status ENUM('VALID', 'INVALID', 'MISSING', 'WARNING', 'NOT_APPLICABLE') DEFAULT 'NOT_APPLICABLE',
    message VARCHAR(500) DEFAULT NULL,
    severity ENUM('info', 'low', 'medium', 'high', 'critical') DEFAULT 'info',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_validation_doc (document_id),
    INDEX idx_validation_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. VERIFICATION RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    verified_by INT DEFAULT NULL,
    decision ENUM('verified', 'rejected', 'needs_review', 'flagged', 'pending') DEFAULT 'pending',
    remarks TEXT DEFAULT NULL,
    
    -- Score breakdown
    completeness_score DECIMAL(5,2) DEFAULT 0,
    format_score DECIMAL(5,2) DEFAULT 0,
    duplicate_score DECIMAL(5,2) DEFAULT 0,
    expiry_score DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    overall_score DECIMAL(5,2) DEFAULT 0,
    
    -- Method
    verification_method ENUM('automatic', 'manual', 'override') DEFAULT 'automatic',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vresults_doc (document_id),
    INDEX idx_vresults_decision (decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. DOCUMENT ISSUES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS document_issues (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    issue_type VARCHAR(100) NOT NULL,
    severity ENUM('info', 'low', 'medium', 'high', 'critical') DEFAULT 'info',
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    category ENUM(
        'missing_field', 'invalid_format', 'expired', 'duplicate',
        'image_quality', 'tampering', 'ocr_confidence', 'inconsistency',
        'missing_element', 'calculation_mismatch', 'other'
    ) DEFAULT 'other',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    INDEX idx_issues_doc (document_id),
    INDEX idx_issues_severity (severity),
    INDEX idx_issues_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) DEFAULT NULL,
    target_id INT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at DESC),
    INDEX idx_audit_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. VERIFICATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS verification_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    actor_id INT DEFAULT NULL,
    from_status VARCHAR(50) DEFAULT NULL,
    to_status VARCHAR(50) DEFAULT NULL,
    remarks TEXT DEFAULT NULL,
    metadata JSON DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_vhist_doc (document_id),
    INDEX idx_vhist_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 10. VALIDATION RULES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS validation_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    document_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    rule_type ENUM('regex', 'required', 'date', 'expiry', 'numeric', 'enum', 'custom') DEFAULT 'required',
    pattern VARCHAR(500) DEFAULT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    is_enabled BOOLEAN DEFAULT TRUE,
    error_message VARCHAR(500) DEFAULT NULL,
    severity ENUM('info', 'low', 'medium', 'high', 'critical') DEFAULT 'medium',
    display_order INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rules_type (document_type),
    INDEX idx_rules_enabled (is_enabled),
    UNIQUE KEY uk_rules_type_field (document_type, field_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 11. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('verification_complete', 'needs_review', 'approved', 'rejected', 'flagged', 'system') DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT DEFAULT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    document_id INT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
