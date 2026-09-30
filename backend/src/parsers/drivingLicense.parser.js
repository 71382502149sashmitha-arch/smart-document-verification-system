/** Driving License Parser */
export default function parseDrivingLicense(text) {
  const fields = [];

  const dlMatch = text.match(/(?:DL\s*(?:No|Number)?|Licence\s*No)\s*[:\-]?\s*([A-Z]{2}[-\s]?\d{2,}[\d\w]*)/i);
  if (dlMatch) {
    fields.push({ fieldName: 'dl_number', fieldValue: dlMatch[1].trim(), fieldType: 'identifier', confidence: 88, isSensitive: true, displayValue: dlMatch[1].trim() });
  }

  const nameMatch = text.match(/Name\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) {
    fields.push({ fieldName: 'name', fieldValue: nameMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 85, isSensitive: false, displayValue: nameMatch[1].trim().split('\n')[0] });
  }

  const dobMatch = text.match(/(?:D\.?O\.?B|Date\s*of\s*Birth)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dobMatch) {
    fields.push({ fieldName: 'date_of_birth', fieldValue: dobMatch[1], fieldType: 'date', confidence: 85, isSensitive: false, displayValue: dobMatch[1] });
  }

  const addressMatch = text.match(/Address\s*[:\-]?\s*(.+?)(?=\n.*(?:Date|Issue|Valid|Class)|$)/is);
  if (addressMatch) {
    const addr = addressMatch[1].replace(/\n/g, ', ').replace(/\s+/g, ' ').trim();
    fields.push({ fieldName: 'address', fieldValue: addr, fieldType: 'text', confidence: 75, isSensitive: false, displayValue: addr });
  }

  const issueMatch = text.match(/(?:Date\s*of\s*Issue|Issue\s*Date|Issued?\s*on)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (issueMatch) {
    fields.push({ fieldName: 'date_of_issue', fieldValue: issueMatch[1], fieldType: 'date', confidence: 85, isSensitive: false, displayValue: issueMatch[1] });
  }

  const expiryMatch = text.match(/(?:Date\s*of\s*Expiry|Expiry|Valid\s*(?:Till|Until|Upto))\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (expiryMatch) {
    fields.push({ fieldName: 'date_of_expiry', fieldValue: expiryMatch[1], fieldType: 'date', confidence: 85, isSensitive: false, displayValue: expiryMatch[1] });
  }

  const classMatch = text.match(/(?:Vehicle\s*Class|Class\s*of\s*Vehicle|COV)\s*[:\-]?\s*([A-Z,\s]+)/i);
  if (classMatch) {
    fields.push({ fieldName: 'vehicle_class', fieldValue: classMatch[1].trim(), fieldType: 'text', confidence: 80, isSensitive: false, displayValue: classMatch[1].trim() });
  }

  const authMatch = text.match(/(?:Issuing\s*Authority|Authority|RTO)\s*[:\-]?\s*(.+)/i);
  if (authMatch) {
    fields.push({ fieldName: 'issuing_authority', fieldValue: authMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: authMatch[1].trim() });
  }

  return fields;
}
