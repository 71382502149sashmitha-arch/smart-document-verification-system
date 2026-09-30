/**
 * Aadhaar Card Parser
 * Extracts: name, aadhaar_number, dob, gender, address, pin_code, vid, qr_code, photograph
 */
import { maskAadhaar } from '../utils/helpers.js';

export default function parseAadhaar(text) {
  const fields = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const fullText = text;

  // Aadhaar number: 4-digit groups
  const aadhaarMatch = fullText.match(/(\d{4}\s?\d{4}\s?\d{4})/);
  if (aadhaarMatch) {
    fields.push({ fieldName: 'aadhaar_number', fieldValue: aadhaarMatch[1], fieldType: 'identifier', confidence: 90, isSensitive: true, displayValue: maskAadhaar(aadhaarMatch[1]) });
  }

  // VID
  const vidMatch = fullText.match(/VID\s*[:\-]?\s*(\d{4}\s?\d{4}\s?\d{4}\s?\d{4})/i);
  if (vidMatch) {
    fields.push({ fieldName: 'vid', fieldValue: vidMatch[1], fieldType: 'identifier', confidence: 80, isSensitive: true, displayValue: 'XXXX XXXX XXXX ' + vidMatch[1].replace(/\s/g, '').slice(-4) });
  }

  // Name - look for patterns like "Name:" or line after common headers
  const nameMatch = fullText.match(/(?:name|नाम)\s*[:\-]?\s*([A-Za-z\s.]+)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim().replace(/\s+/g, ' ');
    if (name.length > 2) {
      fields.push({ fieldName: 'name', fieldValue: name, fieldType: 'text', confidence: 80, isSensitive: false, displayValue: name });
    }
  } else {
    // Try to find a name-like line (all caps, alphabetic)
    for (const line of lines) {
      if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) || /^[A-Z\s]{4,30}$/.test(line)) {
        const skip = /(government|india|aadhaar|unique|identification|male|female|address|dob)/i;
        if (!skip.test(line)) {
          fields.push({ fieldName: 'name', fieldValue: line, fieldType: 'text', confidence: 65, isSensitive: false, displayValue: line });
          break;
        }
      }
    }
  }

  // Date of Birth
  const dobMatch = fullText.match(/(?:DOB|Date\s*of\s*Birth|जन्म\s*तिथि)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dobMatch) {
    fields.push({ fieldName: 'date_of_birth', fieldValue: dobMatch[1], fieldType: 'date', confidence: 85, isSensitive: false, displayValue: dobMatch[1] });
  }

  // Year of Birth
  const yobMatch = fullText.match(/(?:Year\s*of\s*Birth|YOB)\s*[:\-]?\s*(\d{4})/i);
  if (yobMatch && !dobMatch) {
    fields.push({ fieldName: 'year_of_birth', fieldValue: yobMatch[1], fieldType: 'date', confidence: 80, isSensitive: false, displayValue: yobMatch[1] });
  }

  // Gender
  const genderMatch = fullText.match(/\b(Male|Female|पुरुष|महिला|MALE|FEMALE|Other|Transgender)\b/i);
  if (genderMatch) {
    let gender = genderMatch[1];
    if (/पुरुष/.test(gender)) gender = 'Male';
    if (/महिला/.test(gender)) gender = 'Female';
    fields.push({ fieldName: 'gender', fieldValue: gender, fieldType: 'text', confidence: 90, isSensitive: false, displayValue: gender });
  }

  // Address
  const addressMatch = fullText.match(/(?:Address|पता)\s*[:\-]?\s*(.+?)(?=\n\n|\d{4}\s?\d{4}|$)/is);
  if (addressMatch) {
    const address = addressMatch[1].replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    if (address.length > 5) {
      fields.push({ fieldName: 'address', fieldValue: address, fieldType: 'text', confidence: 70, isSensitive: false, displayValue: address });
    }
  }

  // PIN code
  const pinMatch = fullText.match(/\b(\d{6})\b/);
  if (pinMatch) {
    fields.push({ fieldName: 'pin_code', fieldValue: pinMatch[1], fieldType: 'text', confidence: 75, isSensitive: false, displayValue: pinMatch[1] });
  }

  // QR code presence (heuristic — cannot detect from text alone)
  fields.push({ fieldName: 'qr_code', fieldValue: null, fieldType: 'element', confidence: 0, isSensitive: false, displayValue: 'Not Detected (text-based OCR)' });

  // Photograph presence (heuristic)
  fields.push({ fieldName: 'photograph', fieldValue: 'unknown', fieldType: 'element', confidence: 50, isSensitive: false, displayValue: 'Cannot determine from OCR' });

  return fields;
}
