/**
 * Validator Service — Validates extracted fields against rules
 */
import { parseDate, isExpired } from '../utils/helpers.js';
import ValidationRule from '../models/ValidationRule.js';
import logger from '../utils/logger.js';

class ValidatorService {
  /**
   * Validate extracted fields for a document type
   * @param {string} documentType
   * @param {Array} extractedFields - Array of { fieldName, fieldValue, ... }
   * @returns {{ results: Array, validCount: number, invalidCount: number, missingCount: number }}
   */
  async validate(documentType, extractedFields) {
    const results = [];
    let validCount = 0, invalidCount = 0, missingCount = 0, warningCount = 0;

    // Get rules from database
    let rules = [];
    try {
      rules = await ValidationRule.findByDocumentType(documentType);
    } catch (err) {
      logger.warn('Could not load validation rules from DB, using defaults');
    }

    // If no DB rules, use built-in defaults
    if (rules.length === 0) {
      rules = this.getDefaultRules(documentType);
    }

    const fieldMap = {};
    for (const f of extractedFields) {
      fieldMap[f.fieldName] = f.fieldValue;
    }

    for (const rule of rules) {
      const fieldName = rule.field_name || rule.fieldName;
      const value = fieldMap[fieldName];
      const ruleType = rule.rule_type || rule.ruleType;
      const pattern = rule.pattern;
      const required = rule.is_required !== undefined ? rule.is_required : rule.isRequired;
      const errorMsg = rule.error_message || rule.errorMessage || `Validation failed for ${fieldName}`;
      const severity = rule.severity || 'medium';

      let status = 'VALID';
      let message = `${this.formatFieldName(fieldName)} validated`;

      // Check missing
      if (!value || value === 'null' || value === 'undefined') {
        if (required) {
          status = 'MISSING';
          message = errorMsg || `${this.formatFieldName(fieldName)} is missing`;
          missingCount++;
        } else {
          status = 'NOT_APPLICABLE';
          message = `${this.formatFieldName(fieldName)} not found (optional)`;
        }
      } else {
        // Validate based on rule type
        switch (ruleType) {
          case 'regex':
            if (pattern) {
              try {
                const regex = new RegExp(pattern);
                if (!regex.test(value)) {
                  status = 'INVALID';
                  message = errorMsg;
                  invalidCount++;
                } else {
                  message = `Valid ${this.formatFieldName(fieldName)} format`;
                  validCount++;
                }
              } catch (e) {
                status = 'WARNING';
                message = 'Invalid validation pattern configured';
                warningCount++;
              }
            } else {
              validCount++;
            }
            break;

          case 'date':
            const parsedDate = parseDate(value);
            if (!parsedDate || isNaN(parsedDate.getTime())) {
              status = 'INVALID';
              message = errorMsg || 'Invalid date format';
              invalidCount++;
            } else {
              message = 'Valid date format';
              validCount++;
            }
            break;

          case 'expiry':
            const expiryDate = parseDate(value);
            if (!expiryDate || isNaN(expiryDate.getTime())) {
              status = 'INVALID';
              message = 'Invalid expiry date format';
              invalidCount++;
            } else if (isExpired(value)) {
              status = 'INVALID';
              message = `Document has expired (${value})`;
              invalidCount++;
            } else {
              message = 'Document is not expired';
              validCount++;
            }
            break;

          case 'required':
            if (value && value.length > 0) {
              message = `${this.formatFieldName(fieldName)} detected`;
              validCount++;
            } else {
              status = 'MISSING';
              message = errorMsg;
              missingCount++;
            }
            break;

          case 'numeric':
            if (isNaN(parseFloat(value))) {
              status = 'INVALID';
              message = `Invalid numeric value for ${this.formatFieldName(fieldName)}`;
              invalidCount++;
            } else {
              message = `Valid numeric value`;
              validCount++;
            }
            break;

          case 'enum':
            if (pattern) {
              const allowedValues = pattern.split(',').map(v => v.trim().toLowerCase());
              if (!allowedValues.includes(value.toLowerCase())) {
                status = 'INVALID';
                message = errorMsg || `Invalid value. Expected: ${pattern}`;
                invalidCount++;
              } else {
                message = `Valid ${this.formatFieldName(fieldName)}`;
                validCount++;
              }
            } else {
              validCount++;
            }
            break;

          default:
            validCount++;
        }
      }

      results.push({
        fieldName,
        extractedValue: value || null,
        expectedFormat: pattern || (ruleType === 'required' ? 'Non-empty text' : ruleType),
        status,
        message,
        severity: status === 'VALID' ? 'info' : severity,
      });
    }

    return { results, validCount, invalidCount, missingCount, warningCount };
  }

  /** Check invoice calculation: subtotal + taxes = total */
  checkInvoiceCalculation(fields) {
    const fieldMap = {};
    for (const f of fields) {
      fieldMap[f.fieldName] = f.fieldValue;
    }

    const subtotal = parseFloat(fieldMap.subtotal || 0);
    const cgst = parseFloat(fieldMap.cgst || 0);
    const sgst = parseFloat(fieldMap.sgst || 0);
    const igst = parseFloat(fieldMap.igst || 0);
    const tax = parseFloat(fieldMap.tax || 0);
    const total = parseFloat(fieldMap.total || 0);

    if (total > 0 && subtotal > 0) {
      const taxAmount = cgst + sgst + igst || tax;
      const calculated = subtotal + taxAmount;
      const diff = Math.abs(calculated - total);
      if (diff > 1) {
        return {
          fieldName: 'total_check',
          extractedValue: String(total),
          expectedFormat: 'subtotal + taxes',
          status: 'INVALID',
          message: `Calculation mismatch: expected ${calculated.toFixed(2)}, got ${total.toFixed(2)} (difference: ${diff.toFixed(2)})`,
          severity: 'medium',
        };
      }
      return {
        fieldName: 'total_check',
        extractedValue: String(total),
        expectedFormat: 'subtotal + taxes',
        status: 'VALID',
        message: 'Invoice totals verified',
        severity: 'info',
      };
    }
    return null;
  }

  formatFieldName(name) {
    return name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getDefaultRules(documentType) {
    const defaults = {
      aadhaar: [
        { fieldName: 'aadhaar_number', ruleType: 'regex', pattern: '^\\d{4}\\s?\\d{4}\\s?\\d{4}$', isRequired: true, errorMessage: 'Invalid Aadhaar number format', severity: 'critical' },
        { fieldName: 'name', ruleType: 'required', isRequired: true, errorMessage: 'Name is required', severity: 'high' },
        { fieldName: 'date_of_birth', ruleType: 'date', isRequired: true, errorMessage: 'Invalid date of birth', severity: 'high' },
        { fieldName: 'gender', ruleType: 'enum', pattern: 'Male,Female,Other', isRequired: true, errorMessage: 'Invalid gender', severity: 'medium' },
        { fieldName: 'address', ruleType: 'required', isRequired: true, errorMessage: 'Address is required', severity: 'medium' },
        { fieldName: 'pin_code', ruleType: 'regex', pattern: '^\\d{6}$', isRequired: true, errorMessage: 'Invalid PIN code', severity: 'medium' },
      ],
      pan: [
        { fieldName: 'pan_number', ruleType: 'regex', pattern: '^[A-Z]{5}[0-9]{4}[A-Z]$', isRequired: true, errorMessage: 'Invalid PAN format', severity: 'critical' },
        { fieldName: 'name', ruleType: 'required', isRequired: true, errorMessage: 'Name is required', severity: 'high' },
        { fieldName: 'father_name', ruleType: 'required', isRequired: false, errorMessage: 'Father name not found', severity: 'low' },
        { fieldName: 'date_of_birth', ruleType: 'date', isRequired: true, errorMessage: 'Invalid date of birth', severity: 'high' },
      ],
      passport: [
        { fieldName: 'passport_number', ruleType: 'regex', pattern: '^[A-Z][0-9]{7}$', isRequired: true, errorMessage: 'Invalid passport number', severity: 'critical' },
        { fieldName: 'surname', ruleType: 'required', isRequired: true, errorMessage: 'Surname is required', severity: 'high' },
        { fieldName: 'given_names', ruleType: 'required', isRequired: true, errorMessage: 'Given names required', severity: 'high' },
        { fieldName: 'date_of_birth', ruleType: 'date', isRequired: true, errorMessage: 'Invalid DOB', severity: 'high' },
        { fieldName: 'date_of_expiry', ruleType: 'expiry', isRequired: true, errorMessage: 'Document expired', severity: 'critical' },
      ],
      driving_license: [
        { fieldName: 'dl_number', ruleType: 'required', isRequired: true, errorMessage: 'DL number is required', severity: 'critical' },
        { fieldName: 'name', ruleType: 'required', isRequired: true, errorMessage: 'Name is required', severity: 'high' },
        { fieldName: 'date_of_birth', ruleType: 'date', isRequired: true, errorMessage: 'Invalid DOB', severity: 'high' },
        { fieldName: 'date_of_expiry', ruleType: 'expiry', isRequired: true, errorMessage: 'DL expired', severity: 'critical' },
        { fieldName: 'vehicle_class', ruleType: 'required', isRequired: true, errorMessage: 'Vehicle class required', severity: 'medium' },
      ],
    };
    return defaults[documentType] || [
      { fieldName: 'name', ruleType: 'required', isRequired: true, errorMessage: 'Name is required', severity: 'high' },
    ];
  }
}

export default new ValidatorService();
