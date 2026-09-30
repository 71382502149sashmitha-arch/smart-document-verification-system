/**
 * Parser Registry — Maps document types to their parsers
 */
import parseAadhaar from './aadhaar.parser.js';
import parsePAN from './pan.parser.js';
import parsePassport from './passport.parser.js';
import parseDrivingLicense from './drivingLicense.parser.js';
import parseCollegeCertificate from './collegeCertificate.parser.js';
import parseMarksheet from './marksheet.parser.js';
import parseBirthCertificate from './birthCertificate.parser.js';
import parseEmployeeId from './employeeId.parser.js';
import parseResume from './resume.parser.js';
import parseInvoice from './invoice.parser.js';
import parseBankStatement from './bankStatement.parser.js';

const parsers = {
  aadhaar: parseAadhaar,
  pan: parsePAN,
  passport: parsePassport,
  driving_license: parseDrivingLicense,
  college_certificate: parseCollegeCertificate,
  marksheet: parseMarksheet,
  birth_certificate: parseBirthCertificate,
  employee_id: parseEmployeeId,
  resume: parseResume,
  invoice: parseInvoice,
  bank_statement: parseBankStatement,
};

/**
 * Get the parser function for a document type
 * @param {string} documentType 
 * @returns {Function|null}
 */
export function getParser(documentType) {
  return parsers[documentType] || null;
}

/**
 * Parse text using the appropriate parser
 * @param {string} documentType
 * @param {string} text - Raw OCR text
 * @returns {Array} Array of extracted fields
 */
export function parseDocument(documentType, text) {
  const parser = getParser(documentType);
  if (!parser) {
    return [];
  }
  try {
    return parser(text);
  } catch (error) {
    console.error(`Parser error for ${documentType}:`, error.message);
    return [];
  }
}

export default parsers;
