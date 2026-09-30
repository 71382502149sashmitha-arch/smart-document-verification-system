/**
 * Tampering Detection Service — Basic heuristic indicators
 * These are NOT forensic-grade checks. Results are labeled as "Potential Indicators".
 */
import sharp from 'sharp';
import logger from '../utils/logger.js';

class TamperingService {
  /**
   * Check for basic tampering indicators
   * @param {string} filePath
   * @param {Object} metadata - Image metadata from sharp
   * @returns {{ risk: string, indicators: Array }}
   */
  async analyze(filePath) {
    const indicators = [];
    let riskScore = 0;

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      // 1. Check for unusual metadata
      if (metadata.format === 'jpeg') {
        // Very low quality JPEG may indicate multiple re-saves
        if (metadata.chromaSubsampling === '4:2:0' && metadata.quality && metadata.quality < 30) {
          indicators.push({
            type: 'compression',
            severity: 'LOW',
            message: 'Image has very low JPEG quality, possibly re-saved multiple times',
          });
          riskScore += 10;
        }
      }

      // 2. Check for unusual dimensions (too perfect crop)
      if (metadata.width && metadata.height) {
        const aspect = metadata.width / metadata.height;
        if (aspect > 4 || aspect < 0.25) {
          indicators.push({
            type: 'dimensions',
            severity: 'LOW',
            message: 'Unusual aspect ratio, possibly excessively cropped',
          });
          riskScore += 5;
        }
      }

      // 3. Check for missing EXIF data (potential edit)
      if (!metadata.exif && metadata.format === 'jpeg') {
        indicators.push({
          type: 'metadata',
          severity: 'LOW',
          message: 'No EXIF metadata found — image may have been processed or stripped',
        });
        riskScore += 5;
      }

      // 4. Check for PNG with high compression on photo-like content
      if (metadata.format === 'png' && metadata.channels === 4) {
        indicators.push({
          type: 'format',
          severity: 'LOW',
          message: 'PNG with alpha channel — document images typically do not have transparency',
        });
        riskScore += 5;
      }

      // 5. Region inconsistency check (simplified)
      // Compare variance of different quadrants
      try {
        const width = metadata.width;
        const height = metadata.height;
        const halfW = Math.floor(width / 2);
        const halfH = Math.floor(height / 2);

        const quadrants = [
          { left: 0, top: 0, width: halfW, height: halfH },
          { left: halfW, top: 0, width: halfW, height: halfH },
          { left: 0, top: halfH, width: halfW, height: halfH },
          { left: halfW, top: halfH, width: halfW, height: halfH },
        ];

        const quadrantStats = [];
        for (const q of quadrants) {
          try {
            const stats = await sharp(filePath).extract(q).stats();
            quadrantStats.push({
              mean: stats.channels.reduce((s, c) => s + c.mean, 0) / stats.channels.length,
              stdev: stats.channels.reduce((s, c) => s + c.stdev, 0) / stats.channels.length,
            });
          } catch {
            // Skip if extraction fails
          }
        }

        if (quadrantStats.length === 4) {
          const stdevs = quadrantStats.map(q => q.stdev);
          const maxStdev = Math.max(...stdevs);
          const minStdev = Math.min(...stdevs);

          if (maxStdev > 0 && minStdev > 0 && (maxStdev / minStdev) > 3) {
            indicators.push({
              type: 'region_inconsistency',
              severity: 'MEDIUM',
              message: 'Significant variation between image quadrants — possible pasted region',
            });
            riskScore += 15;
          }
        }
      } catch (quadErr) {
        logger.debug('Quadrant analysis skipped:', quadErr.message);
      }

      // 6. Screenshot-like dimensions
      const screenshotDims = [
        [1920, 1080], [1366, 768], [1440, 900], [2560, 1440],
        [1280, 720], [1024, 768], [3840, 2160],
      ];
      const isScreenshot = screenshotDims.some(
        ([w, h]) => metadata.width === w && metadata.height === h
      );
      if (isScreenshot) {
        indicators.push({
          type: 'screenshot',
          severity: 'LOW',
          message: 'Image dimensions match common screen resolutions — may be a screenshot',
        });
        riskScore += 5;
      }

    } catch (error) {
      logger.error('Tampering analysis failed:', error.message);
    }

    // Determine risk level
    let risk = 'none';
    if (riskScore >= 25) risk = 'high';
    else if (riskScore >= 15) risk = 'medium';
    else if (riskScore > 0) risk = 'low';

    return { risk, indicators, riskScore };
  }
}

export default new TamperingService();
