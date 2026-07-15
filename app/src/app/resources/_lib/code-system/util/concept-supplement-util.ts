import { ConceptSearchParams } from 'term-web/resources/_lib/code-system/model/concept-search-params';

export class ConceptSupplementUtil {
  // Request supplement designations for any referenced code system. The server auto-discovers
  // supplements (content=supplement) by their base_code_system when includeSupplement + a
  // displayLanguage are set, so a plain, non-supplemented code system is just a cheap no-op.
  // This lets localized designations (e.g. the ucum-lt supplement's unit aliases) surface for
  // every coding reference, not only the hardcoded `ucum` case.
  public static forCodeSystem(codeSystem?: string, language?: string): Pick<ConceptSearchParams, 'includeSupplement' | 'displayLanguage'> {
    if (!codeSystem) {
      return {};
    }
    return {
      includeSupplement: true,
      displayLanguage: language
    };
  }

  public static forSearchScope(codeSystems?: string[], language?: string): Pick<ConceptSearchParams, 'includeSupplement' | 'displayLanguage'> {
    return {
      includeSupplement: true,
      displayLanguage: language
    };
  }
}
