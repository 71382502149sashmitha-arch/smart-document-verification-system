/**
 * Passport Parser
 * Extracts: passport_number, name, surname, given_names, nationality, dob, sex, 
 *           place_of_birth, date_of_issue, date_of_expiry, authority, mrz
 */
export default function parsePassport(text) {
  const fields = [];

  // Passport number
  const passportMatch = text.match(/(?:Passport\s*(?:No|Number)?)\s*[:\-]?\s*([A-Z][0-9]{7})/i);
  if (passportMatch) {
    fields.push({ fieldName: 'passport_number', fieldValue: passportMatch[1], fieldType: 'identifier', confidence: 92, isSensitive: true, displayValue: passportMatch[1] });
  } else {
    const pnMatch = text.match(/\b([A-Z][0-9]{7})\b/);
    if (pnMatch) {
      fields.push({ fieldName: 'passport_number', fieldValue: pnMatch[1], fieldType: 'identifier', confidence: 75, isSensitive: true, displayValue: pnMatch[1] });
    }
  }

  // Surname
  const surnameMatch = text.match(/Surname\s*[:\-]?\s*([A-Z][A-Za-z\s]+)/i);
  if (surnameMatch) {
    fields.push({ fieldName: 'surname', fieldValue: surnameMatch[1].trim(), fieldType: 'text', confidence: 88, isSensitive: false, displayValue: surnameMatch[1].trim() });
  }

  // Given Names
  const givenMatch = text.match(/Given\s*Names?\s*[:\-]?\s*([A-Z][A-Za-z\s]+)/i);
  if (givenMatch) {
    fields.push({ fieldName: 'given_names', fieldValue: givenMatch[1].trim(), fieldType: 'text', confidence: 88, isSensitive: false, displayValue: givenMatch[1].trim() });
  }

  // Nationality
  const nationalityMatch = text.match(/Nationality\s*[:\-]?\s*([A-Z]+)/i);
  if (nationalityMatch) {
    fields.push({ fieldName: 'nationality', fieldValue: nationalityMatch[1].trim(), fieldType: 'text', confidence: 90, isSensitive: false, displayValue: nationalityMatch[1].trim() });
  }

  // Sex
  const sexMatch = text.match(/Sex\s*[:\-]?\s*([MF])\b/i);
  if (sexMatch) {
    fields.push({ fieldName: 'sex', fieldValue: sexMatch[1].toUpperCase(), fieldType: 'text', confidence: 92, isSensitive: false, displayValue: sexMatch[1].toUpperCase() === 'M' ? 'Male' : 'Female' });
  }

  // Date of Birth
  const dobMatch = text.match(/(?:Date\s*of\s*Birth|DOB)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dobMatch) {
    fields.push({ fieldName: 'date_of_birth', fieldValue: dobMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: dobMatch[1] });
  }

  // Place of Birth
  const pobMatch = text.match(/Place\s*of\s*Birth\s*[:\-]?\s*([A-Z][A-Za-z\s,]+)/i);
  if (pobMatch) {
    fields.push({ fieldName: 'place_of_birth', fieldValue: pobMatch[1].trim(), fieldType: 'text', confidence: 82, isSensitive: false, displayValue: pobMatch[1].trim() });
  }

  // Date of Issue
  const doiMatch = text.match(/Date\s*of\s*Issue\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (doiMatch) {
    fields.push({ fieldName: 'date_of_issue', fieldValue: doiMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: doiMatch[1] });
  }

  // Date of Expiry
  const doeMatch = text.match(/Date\s*of\s*Expiry\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (doeMatch) {
    fields.push({ fieldName: 'date_of_expiry', fieldValue: doeMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: doeMatch[1] });
  }

  // Authority
  const authMatch = text.match(/Authority\s*[:\-]?\s*(.+)/i);
  if (authMatch) {
    fields.push({ fieldName: 'authority', fieldValue: authMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: authMatch[1].trim() });
  }

  // MRZ
  const mrzMatch = text.match(/(P<[A-Z]{3}.+)/);
  if (mrzMatch) {
    fields.push({ fieldName: 'mrz', fieldValue: mrzMatch[1], fieldType: 'text', confidence: 80, isSensitive: false, displayValue: 'Detected' });
  }

  return fields;
}
