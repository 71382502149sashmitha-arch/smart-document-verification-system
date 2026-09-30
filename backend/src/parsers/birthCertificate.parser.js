/** Birth Certificate Parser */
export default function parseBirthCertificate(text) {
  const fields = [];

  const nameMatch = text.match(/(?:Name\s*(?:of\s*(?:the\s*)?child)?|Child'?s?\s*Name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) fields.push({ fieldName: 'name', fieldValue: nameMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: nameMatch[1].trim().split('\n')[0] });

  const dobMatch = text.match(/(?:Date\s*of\s*Birth|DOB|Born\s*on)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dobMatch) fields.push({ fieldName: 'date_of_birth', fieldValue: dobMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: dobMatch[1] });

  const pobMatch = text.match(/(?:Place\s*of\s*Birth)\s*[:\-]?\s*([A-Za-z\s,]+)/i);
  if (pobMatch) fields.push({ fieldName: 'place_of_birth', fieldValue: pobMatch[1].trim(), fieldType: 'text', confidence: 80, isSensitive: false, displayValue: pobMatch[1].trim() });

  const genderMatch = text.match(/(?:Sex|Gender)\s*[:\-]?\s*(Male|Female|Boy|Girl|Other)/i);
  if (genderMatch) {
    let g = genderMatch[1];
    if (/boy/i.test(g)) g = 'Male';
    if (/girl/i.test(g)) g = 'Female';
    fields.push({ fieldName: 'gender', fieldValue: g, fieldType: 'text', confidence: 88, isSensitive: false, displayValue: g });
  }

  const fatherMatch = text.match(/(?:Father|Father'?s?\s*Name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (fatherMatch) fields.push({ fieldName: 'father_name', fieldValue: fatherMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: fatherMatch[1].trim().split('\n')[0] });

  const motherMatch = text.match(/(?:Mother|Mother'?s?\s*Name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (motherMatch) fields.push({ fieldName: 'mother_name', fieldValue: motherMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: motherMatch[1].trim().split('\n')[0] });

  const regMatch = text.match(/(?:Registration|Reg)\s*(?:No|Number)\s*[:\-]?\s*([\dA-Z\-/]+)/i);
  if (regMatch) fields.push({ fieldName: 'registration_number', fieldValue: regMatch[1], fieldType: 'identifier', confidence: 85, isSensitive: false, displayValue: regMatch[1] });

  const regDateMatch = text.match(/(?:Registration\s*Date|Date\s*of\s*Registration|Registered\s*on)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (regDateMatch) fields.push({ fieldName: 'registration_date', fieldValue: regDateMatch[1], fieldType: 'date', confidence: 82, isSensitive: false, displayValue: regDateMatch[1] });

  const authMatch = text.match(/(?:Issuing\s*Authority|Registrar|Municipal|Corporation)\s*[:\-]?\s*(.+)/i);
  if (authMatch) fields.push({ fieldName: 'issuing_authority', fieldValue: authMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: authMatch[1].trim() });

  return fields;
}
