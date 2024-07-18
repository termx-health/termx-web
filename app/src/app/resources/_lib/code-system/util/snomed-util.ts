import {isNil} from '@kodality-web/core-util';
import {CodeSystemConcept} from '../model/code-system-concept';
import {ConceptUtil} from './concept-util';

export class SnomedUtil {
  public static getBranch(uri: string, modules: CodeSystemConcept[]): string {
    const uriParsed = uri.split('/');
    if (uriParsed.length < 5) {
      return undefined;
    }

    const moduleId = uriParsed[4];
    const module = modules.find(m => ConceptUtil.getPropertyValue(m, 'moduleId') === moduleId);
    const branchPath = ConceptUtil.getPropertyValue(module, 'branchPath');
    const version = uriParsed.length < 7 ? undefined : this.convertDate(uriParsed[6]);
    return isNil(branchPath) ? undefined : branchPath + (isNil(version) ? '' : '/' + version);
  }

  private static convertDate(dateString: string): string {
    if (dateString.length !== 8 || isNil(dateString)) {
      return undefined;
    }
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
}
