/**
 * Report Service — Generates PDF verification reports using PDFKit
 */
import PDFDocument from 'pdfkit';
import logger from '../utils/logger.js';

class ReportService {
  /**
   * Generate a PDF verification report
   * @returns {PDFDocument} A readable stream
   */
  generate({ document, extractedFields, validationResults, issues, verificationResult, verificationHistory, user }) {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

    // ---- HEADER ----
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#1a56db')
      .text('SMART DOCUMENT VERIFICATION SYSTEM', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(14).font('Helvetica').fillColor('#374151')
      .text('Verification Report', { align: 'center' });
    doc.moveDown(0.5);

    // Separator
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(0.5);

    // ---- REPORT METADATA ----
    this.addSection(doc, 'Report Information');
    this.addField(doc, 'Verification ID', `VR-${String(verificationResult?.id || document.id).padStart(6, '0')}`);
    this.addField(doc, 'Document ID', `DOC-${String(document.id).padStart(6, '0')}`);
    this.addField(doc, 'Document Type', this.formatDocType(document.document_type));
    this.addField(doc, 'Uploaded By', user?.full_name || 'N/A');
    this.addField(doc, 'Upload Date', new Date(document.created_at).toLocaleString('en-IN'));
    this.addField(doc, 'Verification Date', verificationResult?.created_at ? new Date(verificationResult.created_at).toLocaleString('en-IN') : 'N/A');
    doc.moveDown(0.5);

    // ---- VERIFICATION SUMMARY ----
    this.addSection(doc, 'Verification Summary');
    const score = verificationResult?.overall_score || document.verification_score || 0;
    const decision = verificationResult?.decision || document.verification_status || 'pending';

    this.addField(doc, 'Verification Score', `${score}/100`);
    this.addField(doc, 'Final Decision', decision.toUpperCase().replace(/_/g, ' '));
    this.addField(doc, 'Classification Confidence', `${document.classification_confidence || 0}%`);
    this.addField(doc, 'Image Quality', `${document.image_quality_score || 0}/100`);
    this.addField(doc, 'OCR Confidence', `${document.ocr_confidence || 0}%`);
    this.addField(doc, 'Verification Method', verificationResult?.verification_method || 'automatic');
    doc.moveDown(0.5);

    // Score breakdown
    if (verificationResult) {
      this.addSection(doc, 'Score Breakdown');
      this.addField(doc, 'Completeness', `${verificationResult.completeness_score || 0}%`);
      this.addField(doc, 'Format Validity', `${verificationResult.format_score || 0}%`);
      this.addField(doc, 'Duplicate Check', `${verificationResult.duplicate_score || 0}%`);
      this.addField(doc, 'Expiry Check', `${verificationResult.expiry_score || 0}%`);
      this.addField(doc, 'Quality Score', `${verificationResult.quality_score || 0}%`);
      doc.moveDown(0.5);
    }

    // ---- EXTRACTED INFORMATION ----
    if (extractedFields && extractedFields.length > 0) {
      this.checkNewPage(doc);
      this.addSection(doc, 'Extracted Information');

      for (const field of extractedFields) {
        const displayVal = field.is_sensitive ? (field.display_value || '****') : (field.field_value || 'N/A');
        this.addField(doc, this.formatFieldName(field.field_name), displayVal);
      }
      doc.moveDown(0.5);
    }

    // ---- FIELD VALIDATION ----
    if (validationResults && validationResults.length > 0) {
      this.checkNewPage(doc);
      this.addSection(doc, 'Field Validation Results');

      // Table header
      const tableTop = doc.y;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#374151');
      doc.text('Field', 50, tableTop, { width: 120 });
      doc.text('Value', 170, tableTop, { width: 130 });
      doc.text('Status', 300, tableTop, { width: 80 });
      doc.text('Message', 380, tableTop, { width: 165 });
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#d1d5db');
      doc.moveDown(0.3);

      doc.font('Helvetica').fontSize(8);
      for (const vr of validationResults) {
        if (doc.y > 750) { doc.addPage(); }
        const y = doc.y;
        const statusColor = vr.status === 'VALID' ? '#059669' : vr.status === 'INVALID' ? '#dc2626' : vr.status === 'MISSING' ? '#d97706' : '#6b7280';
        doc.fillColor('#374151').text(this.formatFieldName(vr.field_name), 50, y, { width: 120 });
        doc.text((vr.extracted_value || 'N/A').substring(0, 25), 170, y, { width: 130 });
        doc.fillColor(statusColor).text(vr.status, 300, y, { width: 80 });
        doc.fillColor('#374151').text((vr.message || '').substring(0, 40), 380, y, { width: 165 });
        doc.moveDown(0.4);
      }
      doc.moveDown(0.5);
    }

    // ---- DETECTED ISSUES ----
    if (issues && issues.length > 0) {
      this.checkNewPage(doc);
      this.addSection(doc, 'Detected Issues');
      for (const issue of issues) {
        const severityColor = issue.severity === 'critical' ? '#dc2626' : issue.severity === 'high' ? '#ea580c' : issue.severity === 'medium' ? '#d97706' : '#6b7280';
        doc.fontSize(9).font('Helvetica-Bold').fillColor(severityColor)
          .text(`[${(issue.severity || 'info').toUpperCase()}] ${issue.title}`);
        doc.fontSize(8).font('Helvetica').fillColor('#4b5563')
          .text(issue.description || '');
        doc.moveDown(0.3);
      }
      doc.moveDown(0.5);
    }

    // ---- ADDITIONAL CHECKS ----
    this.checkNewPage(doc);
    this.addSection(doc, 'Additional Checks');
    this.addField(doc, 'Duplicate Check', document.is_duplicate ? 'DUPLICATE FOUND' : 'No Duplicate Found');
    this.addField(doc, 'Expiry Check', document.is_expired ? 'EXPIRED' : 'Not Expired / N/A');
    this.addField(doc, 'Tampering Risk', (document.tampering_risk || 'none').toUpperCase());
    this.addField(doc, 'QR Code', document.qr_detected ? 'Detected' : 'Not Detected');
    doc.moveDown(0.5);

    // ---- VERIFIER REMARKS ----
    if (verificationResult?.remarks) {
      this.checkNewPage(doc);
      this.addSection(doc, 'Verifier Remarks');
      doc.fontSize(10).font('Helvetica').fillColor('#374151')
        .text(verificationResult.remarks);
      doc.moveDown(0.5);
    }

    // ---- AUDIT TRAIL ----
    if (verificationHistory && verificationHistory.length > 0) {
      this.checkNewPage(doc);
      this.addSection(doc, 'Verification Timeline');
      for (const h of verificationHistory) {
        doc.fontSize(9).font('Helvetica').fillColor('#374151')
          .text(`${new Date(h.created_at).toLocaleString('en-IN')} — ${h.action} ${h.actor_name ? 'by ' + h.actor_name : '(automatic)'}${h.remarks ? ': ' + h.remarks : ''}`);
        doc.moveDown(0.2);
      }
      doc.moveDown(0.5);
    }

    // ---- DISCLAIMER ----
    this.checkNewPage(doc);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#e5e7eb');
    doc.moveDown(0.5);
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#6b7280')
      .text(
        'DISCLAIMER: This report represents automated document processing and validation indicators. ' +
        'It does not by itself establish legal authenticity. The verification score and decision are based on ' +
        'pattern matching, format validation, and heuristic analysis. For legal purposes, please consult the ' +
        'relevant issuing authority.',
        { align: 'center' }
      );
    doc.moveDown(0.3);
    doc.fontSize(8).fillColor('#9ca3af')
      .text(`Generated on ${new Date().toLocaleString('en-IN')} by Smart Document Verification System`, { align: 'center' });

    doc.end();
    return doc;
  }

  addSection(doc, title) {
    doc.fontSize(13).font('Helvetica-Bold').fillColor('#1e40af').text(title);
    doc.moveDown(0.2);
    doc.moveTo(50, doc.y).lineTo(200, doc.y).stroke('#3b82f6');
    doc.moveDown(0.4);
  }

  addField(doc, label, value) {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#4b5563').text(`${label}: `, { continued: true });
    doc.font('Helvetica').fillColor('#111827').text(String(value || 'N/A'));
  }

  formatFieldName(name) {
    return (name || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  formatDocType(type) {
    const map = {
      aadhaar: 'Aadhaar Card', pan: 'PAN Card', passport: 'Passport',
      driving_license: 'Driving License', college_certificate: 'College Certificate',
      marksheet: 'Marksheet', birth_certificate: 'Birth Certificate',
      employee_id: 'Employee ID', resume: 'Resume', invoice: 'Invoice',
      bank_statement: 'Bank Statement',
    };
    return map[type] || type || 'Unknown';
  }

  checkNewPage(doc) {
    if (doc.y > 700) doc.addPage();
  }
}

export default new ReportService();
