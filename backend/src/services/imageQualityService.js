/**
 * Image Quality Service — Checks resolution, blur, brightness, contrast
 * Uses the 'sharp' library for image analysis
 */
import sharp from 'sharp';
import logger from '../utils/logger.js';

class ImageQualityService {
  /**
   * Analyze image quality
   * @param {string} filePath
   * @returns {{ score: number, details: Object, issues: Array }}
   */
  async analyze(filePath) {
    const issues = [];
    const details = {};
    let score = 100;

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      const stats = await image.stats();

      // Resolution check
      details.width = metadata.width || 0;
      details.height = metadata.height || 0;
      details.format = metadata.format || 'unknown';
      details.space = metadata.space || 'unknown';
      details.channels = metadata.channels || 0;
      details.dpi = metadata.density || 0;

      if (metadata.width < 300 || metadata.height < 300) {
        score -= 25;
        issues.push({ type: 'resolution', severity: 'high', message: `Very low resolution: ${metadata.width}x${metadata.height}` });
        details.resolution = 'very_low';
      } else if (metadata.width < 600 || metadata.height < 600) {
        score -= 15;
        issues.push({ type: 'resolution', severity: 'medium', message: `Low resolution: ${metadata.width}x${metadata.height}` });
        details.resolution = 'low';
      } else if (metadata.width < 1000 || metadata.height < 1000) {
        score -= 5;
        details.resolution = 'medium';
      } else {
        details.resolution = 'high';
      }

      // Brightness check (using mean of channels)
      const meanBrightness = stats.channels.reduce((sum, ch) => sum + ch.mean, 0) / stats.channels.length;
      details.brightness = Math.round(meanBrightness);

      if (meanBrightness < 50) {
        score -= 15;
        issues.push({ type: 'brightness', severity: 'medium', message: 'Image is too dark' });
        details.brightnessLevel = 'dark';
      } else if (meanBrightness > 220) {
        score -= 10;
        issues.push({ type: 'brightness', severity: 'low', message: 'Image is too bright/overexposed' });
        details.brightnessLevel = 'overexposed';
      } else {
        details.brightnessLevel = 'acceptable';
      }

      // Contrast check (using standard deviation)
      const stdDev = stats.channels.reduce((sum, ch) => sum + ch.stdev, 0) / stats.channels.length;
      details.contrast = Math.round(stdDev);

      if (stdDev < 20) {
        score -= 15;
        issues.push({ type: 'contrast', severity: 'medium', message: 'Very low contrast' });
        details.contrastLevel = 'very_low';
      } else if (stdDev < 40) {
        score -= 5;
        details.contrastLevel = 'low';
      } else {
        details.contrastLevel = 'acceptable';
      }

      // Blur detection using Laplacian variance approximation
      // We downsample, convert to greyscale, and check sharpness via stats
      try {
        const greyBuffer = await sharp(filePath)
          .greyscale()
          .resize(500, 500, { fit: 'inside' })
          .raw()
          .toBuffer({ resolveWithObject: true });

        const { data, info } = greyBuffer;
        let laplacianVariance = 0;
        const w = info.width;
        const h = info.height;

        // Simple Laplacian: sum of |pixel - average of neighbors|
        for (let y = 1; y < h - 1; y++) {
          for (let x = 1; x < w - 1; x++) {
            const idx = y * w + x;
            const lap = Math.abs(
              4 * data[idx] - data[idx - 1] - data[idx + 1] - data[idx - w] - data[idx + w]
            );
            laplacianVariance += lap * lap;
          }
        }
        laplacianVariance = laplacianVariance / ((w - 2) * (h - 2));
        details.sharpness = Math.round(laplacianVariance);

        if (laplacianVariance < 100) {
          score -= 20;
          issues.push({ type: 'blur', severity: 'high', message: 'Image appears significantly blurred' });
          details.blur = 'severe';
        } else if (laplacianVariance < 500) {
          score -= 10;
          issues.push({ type: 'blur', severity: 'medium', message: 'Image appears slightly blurred' });
          details.blur = 'moderate';
        } else {
          details.blur = 'none';
        }
      } catch (blurError) {
        details.blur = 'unknown';
        logger.debug('Blur detection skipped:', blurError.message);
      }

      // File size check
      details.fileSize = metadata.size || 0;

      // Screenshot detection — common screenshot dimensions
      const screenshotAspects = [
        { w: 1920, h: 1080 }, { w: 1366, h: 768 }, { w: 1440, h: 900 },
        { w: 2560, h: 1440 }, { w: 3840, h: 2160 },
      ];
      const isScreenshotDimension = screenshotAspects.some(
        s => (metadata.width === s.w && metadata.height === s.h) || (metadata.width === s.h && metadata.height === s.w)
      );
      if (isScreenshotDimension) {
        issues.push({ type: 'screenshot', severity: 'low', message: 'Image dimensions match common screenshot resolutions' });
        details.screenshotLike = true;
      }

      score = Math.max(0, Math.min(100, score));
    } catch (error) {
      logger.error('Image quality analysis failed:', error.message);
      score = 50;
      details.error = error.message;
      issues.push({ type: 'analysis_error', severity: 'low', message: 'Could not fully analyze image quality' });
    }

    return { score, details, issues };
  }
}

export default new ImageQualityService();
