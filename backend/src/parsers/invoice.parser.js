/** Invoice Parser */
import { maskAccountNumber } from '../utils/helpers.js';

export default function parseInvoice(text) {
  const fields = [];

  const invMatch = text.match(/(?:Invoice\s*(?:No|Number|#))\s*[:\-]?\s*([\dA-Z\-/]+)/i);
  if (invMatch) fields.push({ fieldName: 'invoice_number', fieldValue: invMatch[1], fieldType: 'identifier', confidence: 90, isSensitive: false, displayValue: invMatch[1] });

  const dateMatch = text.match(/(?:Invoice\s*Date|Date)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dateMatch) fields.push({ fieldName: 'invoice_date', fieldValue: dateMatch[1], fieldType: 'date', confidence: 88, isSensitive: false, displayValue: dateMatch[1] });

  const vendorMatch = text.match(/(?:Vendor|From|Seller|Supplier|Company)\s*[:\-]?\s*([A-Za-z\s.&]+(?:Pvt|Ltd|Inc|Corp|LLC)?[A-Za-z\s.]*)/i);
  if (vendorMatch) fields.push({ fieldName: 'vendor', fieldValue: vendorMatch[1].trim(), fieldType: 'text', confidence: 78, isSensitive: false, displayValue: vendorMatch[1].trim() });

  const custMatch = text.match(/(?:Customer|Bill\s*To|Buyer|Client)\s*[:\-]?\s*([A-Za-z\s.&]+)/i);
  if (custMatch) fields.push({ fieldName: 'customer', fieldValue: custMatch[1].trim(), fieldType: 'text', confidence: 75, isSensitive: false, displayValue: custMatch[1].trim() });

  const gstMatch = text.match(/GSTIN?\s*[:\-]?\s*(\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z\d])/i);
  if (gstMatch) fields.push({ fieldName: 'gstin', fieldValue: gstMatch[1], fieldType: 'identifier', confidence: 90, isSensitive: false, displayValue: gstMatch[1] });

  const addrMatch = text.match(/Address\s*[:\-]?\s*(.+?)(?=\n\n|GSTIN|Invoice|$)/is);
  if (addrMatch) fields.push({ fieldName: 'address', fieldValue: addrMatch[1].replace(/\n/g, ', ').trim(), fieldType: 'text', confidence: 70, isSensitive: false, displayValue: addrMatch[1].replace(/\n/g, ', ').trim() });

  // Line items
  const itemLines = text.match(/^.+\s+\d+\s*[x@]\s*[\d,.]+\s*=\s*[\d,.]+$/gim) || [];
  if (itemLines.length > 0) {
    fields.push({ fieldName: 'line_items', fieldValue: JSON.stringify(itemLines), fieldType: 'table', confidence: 75, isSensitive: false, displayValue: `${itemLines.length} line items` });
  }

  const subtotalMatch = text.match(/Subtotal\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (subtotalMatch) fields.push({ fieldName: 'subtotal', fieldValue: subtotalMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 85, isSensitive: false, displayValue: '₹' + subtotalMatch[1] });

  const cgstMatch = text.match(/CGST\s*(?:\(\d+%\))?\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (cgstMatch) fields.push({ fieldName: 'cgst', fieldValue: cgstMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 85, isSensitive: false, displayValue: '₹' + cgstMatch[1] });

  const sgstMatch = text.match(/SGST\s*(?:\(\d+%\))?\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (sgstMatch) fields.push({ fieldName: 'sgst', fieldValue: sgstMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 85, isSensitive: false, displayValue: '₹' + sgstMatch[1] });

  const igstMatch = text.match(/IGST\s*(?:\(\d+%\))?\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (igstMatch) fields.push({ fieldName: 'igst', fieldValue: igstMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 85, isSensitive: false, displayValue: '₹' + igstMatch[1] });

  const taxMatch = text.match(/(?:Tax|Total\s*Tax)\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (taxMatch) fields.push({ fieldName: 'tax', fieldValue: taxMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 82, isSensitive: false, displayValue: '₹' + taxMatch[1] });

  const totalMatch = text.match(/(?:Grand\s*)?Total\s*[:\-]?\s*[\₹$]?\s*([\d,]+\.?\d*)/i);
  if (totalMatch) fields.push({ fieldName: 'total', fieldValue: totalMatch[1].replace(/,/g, ''), fieldType: 'numeric', confidence: 88, isSensitive: false, displayValue: '₹' + totalMatch[1] });

  const dueMatch = text.match(/(?:Due\s*Date|Payment\s*Due)\s*[:\-]?\s*(\d{1,2}[/\-.]\d{1,2}[/\-.]\d{4})/i);
  if (dueMatch) fields.push({ fieldName: 'due_date', fieldValue: dueMatch[1], fieldType: 'date', confidence: 82, isSensitive: false, displayValue: dueMatch[1] });

  return fields;
}
