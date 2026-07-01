import {compareValues} from '@termx-health/core-util';
import {CodeSystemVersion} from 'term-web/resources/_lib';

export class CodeSystemUtil {

  public static getLastVersion(versions: CodeSystemVersion[]): CodeSystemVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.releaseDate, b.releaseDate))?.[0];
  }

  // Latest first, using semantic-version ordering so 1.0.10 sorts above 1.0.9 (not lexicographically).
  public static sortVersions(versions: CodeSystemVersion[]): CodeSystemVersion[] {
    return [...(versions ?? [])].sort((a, b) => CodeSystemUtil.compareVersions(b.version, a.version));
  }

  // Ascending comparison of version strings. Splits on '.', '-' and '+', comparing numeric
  // segments as numbers and everything else as a natural (numeric-aware) string compare, so
  // mixed schemes like 1.0.10, 2017.3 or 6.0.0-draft all order sensibly.
  private static compareVersions(v1 = '', v2 = ''): number {
    const segments = (v: string): (number | string)[] =>
      v.split(/[.\-+]/).map(s => /^\d+$/.test(s) ? Number(s) : s);
    const a = segments(v1);
    const b = segments(v2);
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      const x = a[i];
      const y = b[i];
      if (x === undefined) {
        return -1; // shorter version is "smaller" (1.0 < 1.0.1)
      }
      if (y === undefined) {
        return 1;
      }
      if (x === y) {
        continue;
      }
      if (typeof x === 'number' && typeof y === 'number') {
        return x - y;
      }
      return String(x).localeCompare(String(y), undefined, {numeric: true});
    }
    return 0;
  }
}
