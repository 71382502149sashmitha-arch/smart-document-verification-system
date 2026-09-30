/** College Certificate Parser */
export default function parseCollegeCertificate(text) {
  const fields = [];

  const nameMatch = text.match(/(?:certify\s*that|awarded\s*to|conferred\s*on|name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) fields.push({ fieldName: 'student_name', fieldValue: nameMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: nameMatch[1].trim().split('\n')[0] });

  const regMatch = text.match(/(?:Register|Reg|Roll|Enrol)\s*(?:No|Number)?\s*[:\-]?\s*([\dA-Z]+)/i);
  if (regMatch) fields.push({ fieldName: 'register_number', fieldValue: regMatch[1], fieldType: 'identifier', confidence: 85, isSensitive: false, displayValue: regMatch[1] });

  const certMatch = text.match(/Certificate\s*(?:No|Number)\s*[:\-]?\s*([\dA-Z\-/]+)/i);
  if (certMatch) fields.push({ fieldName: 'certificate_number', fieldValue: certMatch[1], fieldType: 'identifier', confidence: 82, isSensitive: false, displayValue: certMatch[1] });

  const degreeMatch = text.match(/(?:Bachelor|Master|Doctor|Diploma|B\.?E|B\.?Tech|M\.?Tech|B\.?Sc|M\.?Sc|MBA|BCA|MCA|B\.?A|M\.?A|Ph\.?D)[A-Za-z\s.]*(?:of|in)\s*([A-Za-z\s&.]+)/i);
  if (degreeMatch) {
    const full = text.match(/((?:Bachelor|Master|Doctor|Diploma|B\.?E|B\.?Tech|M\.?Tech)[A-Za-z\s.]*(?:of|in)\s*[A-Za-z\s&.]+)/i);
    fields.push({ fieldName: 'degree', fieldValue: full ? full[1].trim() : degreeMatch[0].trim(), fieldType: 'text', confidence: 80, isSensitive: false, displayValue: full ? full[1].trim() : degreeMatch[0].trim() });
    fields.push({ fieldName: 'department', fieldValue: degreeMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: degreeMatch[1].trim() });
  }

  const instMatch = text.match(/(?:University|Institute|College|School)\s*(?:of)?\s*([A-Za-z\s,.-]+)/i);
  if (instMatch) fields.push({ fieldName: 'institution', fieldValue: instMatch[0].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: instMatch[0].trim() });

  const univMatch = text.match(/([\w\s]+University)/i);
  if (univMatch) fields.push({ fieldName: 'university', fieldValue: univMatch[1].trim(), fieldType: 'text', confidence: 80, isSensitive: false, displayValue: univMatch[1].trim() });

  const yearMatch = text.match(/(?:Year|Batch|Conferred\s*on|Awarded\s*in)\s*[:\-]?\s*(\d{4})/i);
  if (yearMatch) fields.push({ fieldName: 'year', fieldValue: yearMatch[1], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: yearMatch[1] });

  const dateMatch = text.match(/(?:Date\s*of\s*Issue|Dated|Issue\s*Date)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dateMatch) fields.push({ fieldName: 'date_of_issue', fieldValue: dateMatch[1], fieldType: 'date', confidence: 80, isSensitive: false, displayValue: dateMatch[1] });

  const cgpaMatch = text.match(/(?:CGPA|GPA)\s*[:\-]?\s*([\d.]+)/i);
  if (cgpaMatch) fields.push({ fieldName: 'cgpa', fieldValue: cgpaMatch[1], fieldType: 'numeric', confidence: 82, isSensitive: false, displayValue: cgpaMatch[1] });

  const pctMatch = text.match(/(?:Percentage|%)\s*[:\-]?\s*([\d.]+)/i);
  if (pctMatch) fields.push({ fieldName: 'percentage', fieldValue: pctMatch[1], fieldType: 'numeric', confidence: 80, isSensitive: false, displayValue: pctMatch[1] + '%' });

  return fields;
}
