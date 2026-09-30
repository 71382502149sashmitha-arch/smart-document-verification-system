/** Resume Parser — Informational extraction, not strict verification */
export default function parseResume(text) {
  const fields = [];

  // Email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) fields.push({ fieldName: 'email', fieldValue: emailMatch[0], fieldType: 'text', confidence: 92, isSensitive: false, displayValue: emailMatch[0] });

  // Phone
  const phoneMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);
  if (phoneMatch) fields.push({ fieldName: 'phone', fieldValue: phoneMatch[0], fieldType: 'text', confidence: 85, isSensitive: false, displayValue: phoneMatch[0] });

  // Name — typically first line or near the top
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}$/.test(line) && line.length < 40) {
      fields.push({ fieldName: 'name', fieldValue: line, fieldType: 'text', confidence: 75, isSensitive: false, displayValue: line });
      break;
    }
  }

  // Address
  const addrMatch = text.match(/(?:Address|Location)\s*[:\-]?\s*(.+)/i);
  if (addrMatch) fields.push({ fieldName: 'address', fieldValue: addrMatch[1].trim(), fieldType: 'text', confidence: 65, isSensitive: false, displayValue: addrMatch[1].trim() });

  // Skills section
  const skillsMatch = text.match(/(?:Skills|Technical\s*Skills|Key\s*Skills)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|Education|Experience|Project|$)/i);
  if (skillsMatch) {
    const skills = skillsMatch[1].replace(/[\n•·\-]/g, ', ').replace(/,\s*,/g, ',').trim();
    fields.push({ fieldName: 'skills', fieldValue: skills, fieldType: 'text', confidence: 70, isSensitive: false, displayValue: skills.substring(0, 200) });
  }

  // Education
  const eduMatch = text.match(/(?:Education|Academic|Qualification)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|Skills|Experience|Project|$)/i);
  if (eduMatch) {
    fields.push({ fieldName: 'education', fieldValue: eduMatch[1].trim(), fieldType: 'text', confidence: 68, isSensitive: false, displayValue: eduMatch[1].trim().substring(0, 200) });
  }

  // Experience
  const expMatch = text.match(/(?:Experience|Employment|Work\s*History)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|Education|Skills|Project|$)/i);
  if (expMatch) {
    fields.push({ fieldName: 'experience', fieldValue: expMatch[1].trim(), fieldType: 'text', confidence: 65, isSensitive: false, displayValue: expMatch[1].trim().substring(0, 200) });
  }

  // Certifications
  const certMatch = text.match(/(?:Certifications?|Certificates?)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|$)/i);
  if (certMatch) {
    fields.push({ fieldName: 'certifications', fieldValue: certMatch[1].trim(), fieldType: 'text', confidence: 65, isSensitive: false, displayValue: certMatch[1].trim().substring(0, 200) });
  }

  // Projects
  const projMatch = text.match(/(?:Projects?)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|Experience|Education|$)/i);
  if (projMatch) {
    fields.push({ fieldName: 'projects', fieldValue: projMatch[1].trim(), fieldType: 'text', confidence: 60, isSensitive: false, displayValue: projMatch[1].trim().substring(0, 200) });
  }

  // Languages
  const langMatch = text.match(/(?:Languages?)\s*[:\-]?\s*\n?([\s\S]*?)(?=\n\n|$)/i);
  if (langMatch) {
    fields.push({ fieldName: 'languages', fieldValue: langMatch[1].trim(), fieldType: 'text', confidence: 65, isSensitive: false, displayValue: langMatch[1].trim().substring(0, 100) });
  }

  return fields;
}
