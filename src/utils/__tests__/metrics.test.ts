import { describe, expect, it } from 'vitest';

import { calcAccuracy, calcWPM, formatTime } from '../metrics';

describe('metrics Utilities', () => {
  describe('calcWPM', () => {
    it('returns 0 when elapsed time is 0', () => {
      expect(calcWPM(100, 0)).toBe(0);
    });

    it('calculates WPM correctly for 60 seconds', () => {
      // 25 characters in 60 seconds = 5 WPM (25/5 = 5)
      expect(calcWPM(25, 60000)).toBe(5);
    });

    it('calculates WPM correctly for 30 seconds', () => {
      // 25 characters in 30 seconds = 10 WPM
      expect(calcWPM(25, 30000)).toBe(10);
    });

    it('rounds WPM to nearest integer', () => {
      // Should round 4.8 to 5
      expect(calcWPM(24, 60000)).toBe(5);
    });
  });

  describe('calcAccuracy', () => {
    it('returns 100% when no errors', () => {
      expect(calcAccuracy(0, 100)).toBe(100);
    });

    it('returns 100% when total is 0', () => {
      expect(calcAccuracy(0, 0)).toBe(100);
    });

    it('calculates accuracy correctly with errors', () => {
      expect(calcAccuracy(10, 100)).toBe(90);
    });

    it('rounds accuracy to nearest integer', () => {
      expect(calcAccuracy(1, 3)).toBe(67); // 66.67 rounded to 67
    });
  });

  describe('formatTime', () => {
    it('formats seconds only', () => {
      expect(formatTime(5000)).toBe('5s');
      expect(formatTime(45000)).toBe('45s');
    });

    it('formats minutes and seconds', () => {
      expect(formatTime(60000)).toBe('1:00');
      expect(formatTime(90000)).toBe('1:30');
      expect(formatTime(125000)).toBe('2:05');
    });

    it('pads single digit seconds', () => {
      expect(formatTime(65000)).toBe('1:05');
    });
  });
});
