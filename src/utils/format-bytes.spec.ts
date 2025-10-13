import {expect} from 'chai';
import {formatBytes} from './format-bytes.js';

describe('formatBytes (Simple Version)', function () {
  describe('Basic Functionality', function () {
    it('should return "0 Bytes" for 0', function () {
      expect(formatBytes(0)).to.equal('0 Bytes');
    });

    it('should format numbers less than 1 KB as Bytes', function () {
      expect(formatBytes(100)).to.equal('100 Bytes');
      expect(formatBytes(999)).to.equal('999 Bytes');
    });

    it('should format Kilobytes (KB) correctly with default 2 decimals', function () {
      expect(formatBytes(1000)).to.equal('1 KB');
      expect(formatBytes(1234)).to.equal('1.23 KB');
      expect(formatBytes(12345)).to.equal('12.35 KB');
      // округление 999.999 до 1000
      expect(formatBytes(999999)).to.equal('1000 KB');
    });

    it('should format Megabytes (MB) correctly', function () {
      expect(formatBytes(1000000)).to.equal('1 MB');
      expect(formatBytes(1234567)).to.equal('1.23 MB');
      expect(formatBytes(5555555)).to.equal('5.56 MB');
    });

    it('should format Gigabytes (GB) correctly', function () {
      expect(formatBytes(1000000000)).to.equal('1 GB');
      expect(formatBytes(1234567890)).to.equal('1.23 GB');
    });

    it('should format Terabytes (TB) correctly', function () {
      expect(formatBytes(1000000000000)).to.equal('1 TB');
    });
  });

  describe('Edge Cases and Invalid Input', function () {
    it('should return "0 Bytes" for negative numbers', function () {
      expect(formatBytes(-1)).to.equal('0 Bytes');
      expect(formatBytes(-500)).to.equal('0 Bytes');
    });

    it('should return "0 Bytes" for non-finite numbers', function () {
      expect(formatBytes(Infinity)).to.equal('0 Bytes');
      expect(formatBytes(NaN)).to.equal('0 Bytes');
    });

    it('should handle non-number inputs by returning "0 Bytes"', function () {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatBytes(null as any)).to.equal('0 Bytes');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatBytes(undefined as any)).to.equal('0 Bytes');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatBytes('test' as any)).to.equal('0 Bytes');
    });
  });

  describe('With "decimals" Argument', function () {
    it('should handle 0 decimals by rounding down', function () {
      // 12.8 KB -> 13 KB
      expect(formatBytes(12800, 0)).to.equal('13 KB');
      // 12.345 KB -> 12 KB
      expect(formatBytes(12345, 0)).to.equal('12 KB');
    });

    it('should handle 1 decimal place', function () {
      expect(formatBytes(12345, 1)).to.equal('12.3 KB');
    });

    it('should handle more decimals and round up correctly', function () {
      expect(formatBytes(1234567, 4)).to.equal('1.2346 MB');
    });

    it('should treat a negative decimals argument as 0', function () {
      expect(formatBytes(12800, -2)).to.equal('13 KB');
    });
  });
});
