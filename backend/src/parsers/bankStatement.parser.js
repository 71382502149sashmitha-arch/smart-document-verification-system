/** Bank Statement Parser */
import { maskAccountNumber } from '../utils/helpers.js';

export default function parseBankStatement(text) {
  const fields = [];

  const holderMatch = text.match(/(?:Account\s*Holder|Name|Customer\s*Name)\s*[:\-]?\s*([A-Z][A-Za-z\s.]+)/i);
  if (holderMatch) fields.push({ fieldName: 'account_holder', fieldValue: holderMatch[1].trim().split('\n')[0], fieldType: 'text', confidence: 82, isSensitive: false, displayValue: holderMatch[1].trim().split('\n')[0] });

  const accMatch = text.match(/(?:Account\s*(?:No|Number|#))\s*[:\-]?\s*(\d{6,18})/i);
  if (accMatch) fields.push({ fieldName: 'account_number', fieldValue: accMatch[1], fieldType: 'identifier', confidence: 88, isSensitive: true, displayValue: maskAccountNumber(accMatch[1]) });

  const bankMatch = text.match(/([\w\s]+Bank(?:\s+(?:of|&)\s+[\w\s]+)?)/i);
  if (bankMatch) fields.push({ fieldName: 'bank_name', fieldValue: bankMatch[1].trim(), fieldType: 'text', confidence: 80, isSensitive: false, displayValue: bankMatch[1].trim() });

  const branchMatch = text.match(/Branch\s*[:\-]?\s*([A-Za-z\s,]+)/i);
  if (branchMatch) fields.push({ fieldName: 'branch', fieldValue: branchMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: branchMatch[1].trim() });

  const ifscMatch = text.match(/IFSC\s*[:\-]?\s*([A-Z]{4}0\w{6})/i);
  if (ifscMatch) fields.push({ fieldName: 'ifsc', fieldValue: ifscMatch[1], fieldType: 'identifier', confidence: 90, isSensitive: false, displayValue: ifscMatch[1] });

  const periodMatch = text.match(/(?:Statement\s*Period|Period)\s*[:\-]?\s*(.+)/i);
  if (periodMatch) fields.push({ fieldName: 'statement_period', fieldValue: periodMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: periodMatch[1].trim() });

  const openMatch = text.match(/Opening\s*Balance\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (openMatch) fields.push({ fieldName: 'opening_balance', fieldValue: openMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 82, isSensitive: true, displayValue: '₹' + openMatch[1] });

  const closeMatch = text.match(/Closing\s*Balance\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (closeMatch) fields.push({ fieldName: 'closing_balance', fieldValue: closeMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 82, isSensitive: true, displayValue: '₹' + closeMatch[1] });

  // Transaction count heuristic
  const txnLines = text.match(/\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}.+[\d,]+\.?\d{2}/gm) || [];
  if (txnLines.length > 0) {
    fields.push({ fieldName: 'transactions', fieldValue: String(txnLines.length), fieldType: 'numeric', confidence: 70, isSensitive: false, displayValue: `${txnLines.length} transactions detected` });
  }

  return fields;
}
