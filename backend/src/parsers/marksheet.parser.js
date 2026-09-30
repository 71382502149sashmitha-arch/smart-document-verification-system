/** Marksheet Parser - Extracts student info, subjects, marks */
export default function parseMarksheet(text) {
  const fields = [];

  const nameMatch = text.match(/(?:Name|Student)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (nameMatch) fields.push({ fieldName: 'student_name', fieldValue: nameMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 85, isSensitive: false, displayValue: nameMatch[1].trim().split('\n')[0] });

  const regMatch = text.match(/(?:Register|Reg|Roll|Hall\s*Ticket)\s*(?:No|Number)?\s*[:\-]?\s*([\dA-Z\-/]+)/i);
  if (regMatch) fields.push({ fieldName: 'register_number', fieldValue: regMatch[1], fieldType: 'identifier', confidence: 85, isSensitive: false, displayValue: regMatch[1] });

  const instMatch = text.match(/([\w\s]+(?:University|Institute|College|Board))/i);
  if (instMatch) fields.push({ fieldName: 'institution', fieldValue: instMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: instMatch[1].trim() });

  const examMatch = text.match(/(?:Examination|Exam)\s*[:\-]?\s*([A-Za-z\s]+\d{4})/i);
  if (examMatch) fields.push({ fieldName: 'examination', fieldValue: examMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: examMatch[1].trim() });

  const semMatch = text.match(/Semester\s*[:\-]?\s*(\d+|[IVX]+)/i);
  if (semMatch) fields.push({ fieldName: 'semester', fieldValue: semMatch[1], fieldType: 'text', confidence: 80, isSensitive: false, displayValue: semMatch[1] });

  // Extract subject lines: subject name followed by marks
  const subjectLines = text.match(/^[A-Z]{2}\d{3,4}\s+.+\s+\d{1,3}$/gm) || text.match(/^.{5,40}\s+\d{1,3}$/gm) || [];
  const subjects = [];
  for (const line of subjectLines) {
    const parts = line.trim().match(/(.+?)\s+(\d{1,3})$/);
    if (parts) {
      subjects.push({ name: parts[1].trim(), marks: parseInt(parts[2]) });
    }
  }
  if (subjects.length > 0) {
    fields.push({ fieldName: 'subjects', fieldValue: JSON.stringify(subjects), fieldType: 'table', confidence: 75, isSensitive: false, displayValue: `${subjects.length} subjects extracted` });
  }

  const totalMatch = text.match(/Total\s*[:\-]?\s*(\d+)/i);
  if (totalMatch) fields.push({ fieldName: 'total', fieldValue: totalMatch[1], fieldType: 'numeric', confidence: 82, isSensitive: false, displayValue: totalMatch[1] });

  const pctMatch = text.match(/Percentage\s*[:\-]?\s*([\d.]+)/i);
  if (pctMatch) fields.push({ fieldName: 'percentage', fieldValue: pctMatch[1], fieldType: 'numeric', confidence: 80, isSensitive: false, displayValue: pctMatch[1] + '%' });

  const cgpaMatch = text.match(/CGPA\s*[:\-]?\s*([\d.]+)/i);
  if (cgpaMatch) fields.push({ fieldName: 'cgpa', fieldValue: cgpaMatch[1], fieldType: 'numeric', confidence: 82, isSensitive: false, displayValue: cgpaMatch[1] });

  const resultMatch = text.match(/Result\s*[:\-]?\s*(PASS|FAIL|DISTINCTION|FIRST\s*CLASS|SECOND\s*CLASS)/i);
  if (resultMatch) fields.push({ fieldName: 'result', fieldValue: resultMatch[1].toUpperCase(), fieldType: 'text', confidence: 88, isSensitive: false, displayValue: resultMatch[1].toUpperCase() });

  const yearMatch = text.match(/(?:Year|Session)\s*[:\-]?\s*(\d{4})/i);
  if (yearMatch) fields.push({ fieldName: 'year', fieldValue: yearMatch[1], fieldType: 'text', confidence: 78, isSensitive: false, displayValue: yearMatch[1] });

  return fields;
}
