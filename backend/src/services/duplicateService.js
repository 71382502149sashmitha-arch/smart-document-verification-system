/**
 * Duplicate Detection Service
 */
import Document from '../models/Document.js';
import logger from '../utils/logger.js';

const UNIQUE_ID_FIELDS = {
  aadhaar: 'aadhaar_number',
  pan: 'pan_number',
  passport: 'passport_number',
  driving_license: 'dl_number',
  college_certificate: 'certificate_number',
  employee_id: 'employee_id',
  invoice: 'invoice_number',
  birth_certificate: 'registration_number',
  marksheet: 'register_number',
};

class DuplicateService {
  /**
   * Check for duplicate documents based on unique identifiers
   * @param {string} documentType
   * @param {Array} extractedFields
   * @param {number} currentDocId - Exclude this document from search
   * @returns {{ isDuplicate: boolean, duplicateDocId: number|null, field: string, message: string }}
   */
  async check(documentType, extractedFields, currentDocId) {
    const uniqueFieldName = UNIQUE_ID_FIELDS[documentType];
    if (!uniqueFieldName) {
      return { isDuplicate: false, duplicateDocId: null, field: null, message: 'No unique identifier field for this document type' };
    }

    const field = extractedFields.find(f => f.fieldName === uniqueFieldName);
    if (!field || !field.fieldValue) {
      return { isDuplicate: false, duplicateDocId: null, field: uniqueFieldName, message: 'Unique identifier not found in document' };
    }

    const cleanValue = field.fieldValue.replace(/\s/g, '');

    try {
      const duplicates = await Document.checkDuplicate(uniqueFieldName, field.fieldValue, currentDocId);
      // Also check without spaces
      let allDuplicates = duplicates;
      if (cleanValue !== field.fieldValue) {
        const cleanDuplicates = await Document.checkDuplicate(uniqueFieldName, cleanValue, currentDocId);
        allDuplicates = [...duplicates, ...cleanDuplicates];
      }

      // Remove duplicates by doc id
      const seen = new Set();
      allDuplicates = allDuplicates.filter(d => {
        if (seen.has(d.id)) return false;
        seen.add(d.id);
        return true;
      });

      if (allDuplicates.length > 0) {
        logger.warn(`Duplicate detected: ${uniqueFieldName}=${field.fieldValue} in document(s) ${allDuplicates.map(d => d.id).join(', ')}`);
        return {
          isDuplicate: true,
          duplicateDocId: allDuplicates[0].id,
          field: uniqueFieldName,
          message: `Duplicate identifier detected in an existing record. The ${uniqueFieldName.replace(/_/g, ' ')} already exists in the system.`,
        };
      }
    } catch (error) {
      logger.error('Duplicate check failed:', error.message);
    }

    return { isDuplicate: false, duplicateDocId: null, field: uniqueFieldName, message: 'No duplicate found' };
  }
}

export default new DuplicateService();
