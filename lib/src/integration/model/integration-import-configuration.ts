import {LocalizedName} from '@kodality-health/marina-util';

export class IntegrationImportConfiguration {
  public uri?: string;
  public source?: string;
  public version?: string;
  public validFrom?: Date;
  public validTo?: Date;
  public codeSystem?: string;
  public codeSystemName?: LocalizedName;
  public codeSystemDescription?: string;
  public codeSystemVersionDescription?: string;


  public static getDefaultConfigurations(edition: string): IntegrationImportConfiguration {
    const int = {
      uri: 'http://www.whocc.no/atc',
      source: 'WHO',
      codeSystem: 'atc-int',
      codeSystemName: {'et': 'Rahvusvaheline ATC', 'en': 'International ATC'},
      codeSystemDescription: 'Anatomical Therapeutic Chemical Classification System',
    };
    const est = {
      uri: 'https://www.ravimiregister.ee',
      source: 'Ravimiregister',
      codeSystem: 'atc-est',
      codeSystemName: {'et': 'Eesti ATC', 'en': 'Estonian ATC'},
      codeSystemDescription: 'Eesti ATC (Anatomical Therapeutic Chemical Classification System)',
    };
    return {'int': int, 'est': est}[edition] as any;
  }
}
