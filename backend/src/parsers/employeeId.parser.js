/** Employee ID Parser */
export default function parseEmployeeId(text) {
  const fields = [];

  const nameMatch = text.match(/(?:Employee\s*Name|Name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) fields.push({ fieldName: 'employee_name', fieldValue: nameMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 85, isSensitive: false, displayValue: nameMatch[1].trim().split('\n')[0] });

  const idMatch = text.match(/(?:Employee\s*(?:ID|No|Number)|Emp\s*(?:ID|No))\s*[:\-]?\s*([\dA-Z\-]+)/i);
  if (idMatch) fields.push({ fieldName: 'employee_id', fieldValue: idMatch[1], fieldType: 'identifier', confidence: 88, isSensitive: false, displayValue: idMatch[1] });

  const companyMatch = text.match(/(?:Company|Organization|Organisation|Corp|Ltd|Pvt)\s*[:\-]?\s*(.+)/i);
  if (companyMatch) fields.push({ fieldName: 'company', fieldValue: companyMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: companyMatch[1].trim() });

  const deptMatch = text.match(/(?:Department|Dept)\s*[:\-]?\s*([A-Za-z\s&]+)/i);
  if (deptMatch) fields.push({ fieldName: 'department', fieldValue: deptMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: deptMatch[1].trim() });

  const desigMatch = text.match(/(?:Designation|Position|Title)\s*[:\-]?\s*([A-Za-z\s.]+)/i);
  if (desigMatch) fields.push({ fieldName: 'designation', fieldValue: desigMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: desigMatch[1].trim() });

  const dojMatch = text.match(/(?:Date\s*of\s*Joining|DOJ|Joining\s*Date)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dojMatch) fields.push({ fieldName: 'date_of_joining', fieldValue: dojMatch[1], fieldType: 'date', confidence: 82, isSensitive: false, displayValue: dojMatch[1] });

  const issueMatch = text.match(/(?:Issue\s*Date|Issued)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (issueMatch) fields.push({ fieldName: 'date_of_issue', fieldValue: issueMatch[1], fieldType: 'date', confidence: 80, isSensitive: false, displayValue: issueMatch[1] });

  const expiryMatch = text.match(/(?:Expiry|Valid\s*(?:Till|Until|Upto))\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (expiryMatch) fields.push({ fieldName: 'date_of_expiry', fieldValue: expiryMatch[1], fieldType: 'date', confidence: 82, isSensitive: false, displayValue: expiryMatch[1] });

  return fields;
}
