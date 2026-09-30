/**
 * Scoring Service — Calculates verification score
 */
class ScoringService {
  /**
   * Calculate verification score
   * @param {Object} params
   * @returns {{ overallScore, completenessScore, formatScore, duplicateScore, expiryScore, qualityScore, decision, remarks }}
   */
  calculate({ extractedFields, validationResults, isDuplicate, isExpired, imageQualityScore, ocrConfidence, documentType }) {
    // Completeness Score (40%): How many expected fields were found
    const totalFields = validationResults?.results?.length || 1;
    const foundFields = validationResults?.results?.filter(r => r.status !== 'MISSING').length || 0;
    const completenessScore = Math.round((foundFields / totalFields) * 100);

    // Format Validity Score (35%): How many found fields are valid
    const validFields = validationResults?.validCount || 0;
    const invalidFields = validationResults?.invalidCount || 0;
    const checkedFields = validFields + invalidFields;
    const formatScore = checkedFields > 0 ? Math.round((validFields / checkedFields) * 100) : 100;

    // Duplicate Score (15%): 100 if not duplicate, 0 if duplicate
    const duplicateScore = isDuplicate ? 0 : 100;

    // Expiry Score (10%): 100 if not expired, 0 if expired
    const expiryScore = isExpired ? 0 : 100;

    // Quality bonus/penalty
    const qualityScore = Math.min(100, Math.round(
      (imageQualityScore || 70) * 0.5 + (ocrConfidence || 70) * 0.5
    ));

    // Weighted overall score
    let overallScore = Math.round(
      completenessScore * 0.40 +
      formatScore * 0.35 +
      duplicateScore * 0.15 +
      expiryScore * 0.10
    );

    // Apply quality adjustment (±10 points)
    if (qualityScore < 50) {
      overallScore = Math.max(0, overallScore - 10);
    } else if (qualityScore > 85) {
      overallScore = Math.min(100, overallScore + 5);
    }

    // Determine decision
    let decision = 'pending';
    let remarks = '';

    // Check for critical issues that force manual review
    const hasCriticalIssue = validationResults?.results?.some(
      r => r.status === 'INVALID' && r.severity === 'critical'
    );

    if (isDuplicate) {
      decision = 'rejected';
      remarks = 'Duplicate document identifier detected.';
      overallScore = Math.min(overallScore, 35);
    } else if (isExpired) {
      decision = 'needs_review';
      remarks = 'Document appears to be expired. Requires manual review.';
      overallScore = Math.min(overallScore, 49);
    } else if (hasCriticalIssue) {
      decision = 'needs_review';
      remarks = 'Critical validation issues detected. Manual review required.';
    } else if (overallScore >= 85) {
      decision = 'verified';
      remarks = 'All automated checks passed. Document appears valid.';
    } else if (overallScore >= 50) {
      decision = 'needs_review';
      remarks = 'Some validation checks did not pass. Manual review recommended.';
    } else {
      decision = 'rejected';
      remarks = 'Multiple validation failures. Document does not meet verification criteria.';
    }

    // Resume special case — informational only
    if (documentType === 'resume') {
      decision = overallScore >= 50 ? 'verified' : 'needs_review';
      remarks = 'Resume verification is informational. Content extraction ' + (overallScore >= 50 ? 'successful.' : 'incomplete.');
    }

    return {
      overallScore,
      completenessScore,
      formatScore,
      duplicateScore,
      expiryScore,
      qualityScore,
      decision,
      remarks,
    };
  }
}

export default new ScoringService();
