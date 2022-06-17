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

  public defaultAtcInt(): void {
    this.uri = 'http://www.whocc.no/atc';
    this.source = 'WHO';
    this.codeSystem = 'atc-int';
    this.codeSystemName = {'et': 'Rahvusvaheline ATC', 'en': 'International ATC'};
    this.codeSystemDescription = 'Anatomical Therapeutic Chemical Classification System';
    this.validFrom = undefined;
    this.validTo = undefined;
    this.codeSystemVersionDescription = undefined;
    this.version = undefined;
  }

  public defaultAtcEst(): void {
    this.uri = 'https://www.ravimiregister.ee';
    this.source = 'Ravimiregister';
    this.codeSystem = 'atc-est';
    this.codeSystemName = {'et': 'Eesti ATC', 'en': 'Estonian ATC'};
    this.codeSystemDescription = 'Eesti ATC (Anatomical Therapeutic Chemical Classification System)';
    this.validFrom = undefined;
    this.validTo = undefined;
    this.codeSystemVersionDescription = undefined;
    this.version = undefined;
  }
}
