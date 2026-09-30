/**
 * Document Classifier Service
 * Uses keywords, regex, and document-specific phrases to identify document types.
 */
import logger from '../utils/logger.js';

const CLASSIFICATION_RULES = [
  {
    type: 'aadhaar',
    label: 'Aadhaar Card',
    keywords: ['aadhaar', 'unique identification', 'uid', 'uidai', 'government of india', 'enrolment no', 'vid'],
    patterns: [/\d{4}\s?\d{4}\s?\d{4}/, /aadhaar/i, /unique\s*identification/i, /uidai/i],
    weight: 1,
  },
  {
    type: 'pan',
    label: 'PAN Card',
    keywords: ['permanent account number', 'income tax department', 'pan', 'govt of india'],
    patterns: [/[A-Z]{5}[0-9]{4}[A-Z]/, /permanent\s*account\s*number/i, /income\s*tax/i],
    weight: 1,
  },
  {
    type: 'passport',
    label: 'Passport',
    keywords: ['passport', 'republic of india', 'nationality', 'date of expiry', 'place of birth', 'surname', 'given name'],
    patterns: [/passport\s*(no|number)?/i, /republic\s*of\s*india/i, /P<[A-Z]{3}/],
    weight: 1,
  },
  {
    type: 'driving_license',
    label: 'Driving License',
    keywords: ['driving licence', 'driving license', 'motor vehicle', 'vehicle class', 'rto', 'transport'],
    patterns: [/driving\s*licen[cs]e/i, /DL[-\s]?\d{2}/i, /vehicle\s*class/i, /LMV|MCWG|HMV/],
    weight: 1,
  },
  {
    type: 'college_certificate',
    label: 'College Certificate',
    keywords: ['degree certificate', 'bachelor', 'master', 'university', 'conferred', 'awarded', 'certify'],
    patterns: [/degree\s*certificate/i, /bachelor\s*of/i, /master\s*of/i, /conferred/i, /hereby\s*certif/i],
    weight: 1,
  },
  {
    type: 'marksheet',
    label: 'Marksheet',
    keywords: ['statement of marks', 'marksheet', 'marks obtained', 'semester', 'examination', 'result', 'cgpa', 'percentage', 'grade'],
    patterns: [/statement\s*of\s*marks/i, /marks?\s*obtained/i, /semester/i, /CGPA/i, /grade\s*sheet/i],
    weight: 1,
  },
  {
    type: 'birth_certificate',
    label: 'Birth Certificate',
    keywords: ['birth certificate', 'birth registration', 'date of birth', 'place of birth', 'municipal', 'registrar'],
    patterns: [/birth\s*certificate/i, /birth\s*registration/i, /registrar\s*of\s*births/i],
    weight: 1,
  },
  {
    type: 'employee_id',
    label: 'Employee ID',
    keywords: ['employee id', 'employee card', 'id card', 'designation', 'department', 'date of joining'],
    patterns: [/employee\s*(id|card)/i, /date\s*of\s*joining/i, /designation/i],
    weight: 0.8,
  },
  {
    type: 'resume',
    label: 'Resume',
    keywords: ['resume', 'curriculum vitae', 'cv', 'objective', 'experience', 'skills', 'education', 'projects', 'references'],
    patterns: [/curriculum\s*vitae/i, /work\s*experience/i, /educational?\s*qualif/i, /career\s*objective/i],
    weight: 0.7,
  },
  {
    type: 'invoice',
    label: 'Invoice',
    keywords: ['invoice', 'tax invoice', 'bill', 'gstin', 'subtotal', 'total', 'quantity', 'unit price', 'due date'],
    patterns: [/tax\s*invoice/i, /invoice\s*(no|number)/i, /GSTIN/i, /subtotal/i],
    weight: 1,
  },
  {
    type: 'bank_statement',
    label: 'Bank Statement',
    keywords: ['bank statement', 'account statement', 'opening balance', 'closing balance', 'transaction', 'ifsc', 'branch'],
    patterns: [/bank\s*statement/i, /account\s*statement/i, /opening\s*balance/i, /closing\s*balance/i, /IFSC/i],
    weight: 1,
  },
];

class ClassifierService {
  /**
   * Classify a document based on OCR text
   * @param {string} text - Raw OCR text
   * @returns {{ documentType: string, confidence: number, label: string, scores: Object }}
   */
  classify(text) {
    if (!text || text.trim().length < 10) {
      return { documentType: 'unknown', confidence: 0, label: 'Unknown', scores: {} };
    }

    const normalizedText = text.toLowerCase();
    const scores = {};

    for (const rule of CLASSIFICATION_RULES) {
      let score = 0;
      let maxPossible = 0;

      // Keyword matching
      for (const keyword of rule.keywords) {
        maxPossible += 10;
        if (normalizedText.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Pattern matching (weighted higher)
      for (const pattern of rule.patterns) {
        maxPossible += 15;
        if (pattern.test(text)) {
          score += 15;
        }
      }

      const confidence = maxPossible > 0 ? Math.round((score / maxPossible) * 100 * rule.weight) : 0;
      scores[rule.type] = confidence;
    }

    // Find highest scoring type
    let bestType = 'unknown';
    let bestScore = 0;
    let bestLabel = 'Unknown';

    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
        bestLabel = CLASSIFICATION_RULES.find(r => r.type === type)?.label || type;
      }
    }

    // Minimum confidence threshold
    if (bestScore < 20) {
      bestType = 'unknown';
      bestLabel = 'Unknown';
      bestScore = 0;
    }

    logger.info(`Classification result: ${bestType} (${bestScore}%)`);
    return {
      documentType: bestType,
      confidence: bestScore,
      label: bestLabel,
      scores,
    };
  }
}

export default new ClassifierService();
