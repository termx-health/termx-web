import {CodeSystemVersion} from 'term-web/resources/_lib';
import {compareValues} from '@kodality-web/core-util';

export class CodeSystemUtil {

  public static getLastVersion(versions: CodeSystemVersion[]): CodeSystemVersion {
    return versions?.filter(v => ['draft', 'active'].includes(v.status!)).sort((a, b) => compareValues(a.releaseDate, b.releaseDate))?.[0];
  }
}
