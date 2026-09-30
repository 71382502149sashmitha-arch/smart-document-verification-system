/**
 * PAN Card Parser
 * Extracts: pan_number, name, father_name, dob, signature, photograph
 */
export default function parsePAN(text) {
  const fields = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // PAN number
  const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
  if (panMatch) {
    fields.push({ fieldName: 'pan_number', fieldValue: panMatch[1], fieldType: 'identifier', confidence: 95, isSensitive: true, displayValue: panMatch[1] });
  }

  // Name - usually appears after "Name" keyword
  const nameMatch = text.match(/(?:Name|नाम)\s*\n?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) {
    const name = nameMatch[1].trim().split('\n')[0].trim();
    if (name.length > 2 && !/father|पिता/i.test(name)) {
      fields.push({ fieldName: 'name', fieldValue: name, fieldType: 'text', confidence: 85, isSensitive: false, displayValue: name });
    }
  }

  // Father's name
  const fatherMatch = text.match(/(?:Father|पिता)\s*(?:'?s?\s*Name)?\s*\n?\s*([A-Z][A-Za-z\s.]+)/i);
  if (fatherMatch) {
    const fatherName = fatherMatch[1].trim().split('\n')[0].trim();
    if (fatherName.length > 2) {
      fields.push({ fieldName: 'father_name', fieldValue: fatherName, fieldType: 'text', confidence: 82, isSensitive: false, displayValue: fatherName });
    }
  }

  // Date of Birth
  const dobMatch = text.match(/(?:Date\s*of\s*Birth|DOB|जन्म\s*तिथि)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dobMatch) {
    fields.push({ fieldName: 'date_of_birth', fieldValue: dobMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: dobMatch[1] });
  }

  // Signature presence
  const sigPresent = /signature/i.test(text);
  fields.push({ fieldName: 'signature', fieldValue: sigPresent ? 'detected' : null, fieldType: 'element', confidence: sigPresent ? 70 : 30, isSensitive: false, displayValue: sigPresent ? 'Present' : 'Not Detected' });

  // Photograph presence
  fields.push({ fieldName: 'photograph', fieldValue: 'unknown', fieldType: 'element', confidence: 50, isSensitive: false, displayValue: 'Cannot determine from OCR' });

  return fields;
}
