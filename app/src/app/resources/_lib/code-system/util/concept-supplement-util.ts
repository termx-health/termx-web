import { ConceptSearchParams } from 'term-web/resources/_lib/code-system/model/concept-search-params';

export class ConceptSupplementUtil {
  public static forCodeSystem(codeSystem?: string, language?: string): Pick<ConceptSearchParams, 'includeSupplement' | 'displayLanguage'> {
    if (codeSystem !== 'ucum') {
      return {};
    }

    return {
      includeSupplement: true,
      displayLanguage: language
    };
  }

  public static forSearchScope(codeSystems?: string[], language?: string): Pick<ConceptSearchParams, 'includeSupplement' | 'displayLanguage'> {
    if (codeSystems?.length && !codeSystems.includes('ucum')) {
      return {};
    }
    return {
      includeSupplement: true,
      displayLanguage: language
    };
  }
}
