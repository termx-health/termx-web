import {LocalizedName} from '@termx-health/util';

export class IntegrationImportConfiguration {
  public sourceUrl?: string;
  public uri?: string;
  public publisher?: string;
  public version?: string;
  public validFrom?: Date;
  public validTo?: Date;
  public codeSystem?: string;
  public baseCodeSystem?: string;
  public codeSystemName?: LocalizedName;
  public codeSystemDescription?: LocalizedName;
  public codeSystemVersionDescription?: LocalizedName;
  public status?: string;

  public generateValueSet?: boolean;
  public cleanRun?: boolean;
  public cleanConceptRun?: boolean;


  public static getDefaultAtcConfigurations(edition: string): IntegrationImportConfiguration {
      const int = {
        sourceUrl: 'https://www.whocc.no/atc_ddd_index/?code=ATC+code&name=%%%&namesearchtype=containing',
        uri: 'http://www.whocc.no/atc',
        publisher: 'WHO',
        version: '1',
        validFrom: new Date(),
        codeSystem: 'atc-int',
        codeSystemName: {'et': 'Rahvusvaheline ATC', 'en': 'International ATC'},
        codeSystemDescription: {'en': 'Anatomical Therapeutic Chemical Classification System'},
      };
      const est = {
        sourceUrl: 'https://kexus.kodality.com/repository/store-public/terminology/est-atc.csv',
        uri: 'https://fhir.ee/CodeSystem/atc-ee',
        publisher: 'Ravimiregister',
        version: '1',
        validFrom: new Date(),
        codeSystem: 'atc-est',
        codeSystemName: {'et': 'Eesti ATC', 'en': 'Estonian ATC'},
        codeSystemDescription: {'et': 'Eesti ATC (Anatomical Therapeutic Chemical Classification System)'},
      };
    return {'int': int, 'est': est}[edition] as any;
  }

  public static getDefaultIcdConfigurations(edition: string): IntegrationImportConfiguration {
    const int = {
      sourceUrl: 'https://kexus.kodality.com/repository/store-public/terminology/int-icd10en.zip',
      uri: 'http://hl7.org/fhir/sid/icd-10',
      publisher: 'World Health organization',
      version: '10',
      validFrom: new Date(),
      codeSystem: 'icd10',
      codeSystemName: {'en': 'ICD-10 WHO Edition'},
      codeSystemDescription: {'en': 'International Statistical Classification of Diseases and Related Health Problems 10th Revision'},
    };
    return {'int': int}[edition] as any;
  }

  public static getOrphanetConfigurations(): IntegrationImportConfiguration {
    return {
      sourceUrl: 'https://www.orphadata.com/data/xml/en_product3_182.xml',
      uri: 'https://www.orphadata.com/classifications/rare-allergic-disease',
      publisher: 'Orphadata',
      version: '2022-07',
      validFrom: new Date(),
      codeSystem: 'rare-allergic-disease',
      codeSystemName: {'en': 'Rare allergic disease'},
      codeSystemDescription: {'en': ''},
    };
  }

}
