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


  public static getDefaultAtcConfigurations(edition: string): IntegrationImportConfiguration {
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

  public static getDefaultIcdConfigurations(edition: string): IntegrationImportConfiguration {
    const int = {
      uri: 'https://ftp.cdc.gov/pub/Health_Statistics/NCHS/Publications/ICD10CM/2022/',
      source: 'World Health organization',
      version: '10',
      codeSystem: 'icd-10-int',
      codeSystemName: {'en': 'ICD-10 WHO Edition'},
      codeSystemDescription: 'International Statistical Classification of Diseases and Related Health Problems 10th Revision',
    };
    const est = {
      uri: 'https://pub.e-tervis.ee/classifications/RHK-10/8',
      source: 'Ministry of Social Affairs of Estonia',
      version: '8',
      codeSystem: 'icd-10-est',
      codeSystemName: {'et': 'Eesti ICD-10', 'en': 'Estonian ICD-10'},
      codeSystemDescription: ' RHK-10 on rahvusvaheline haiguste ja nendega seotud terviseprobleemide statistiline klassifikatsioon, mille sisu haldaja on Sotsiaalministeerium. Täiendus- ja muudatusettepanekud edastada info@sm.ee.',
      codeSystemVersionDescription: '22.04.2021 on 8. versiooni lisatud järgmised uued koodid:\n' +
        'U08 COVID-19 anamneesis\n' +
        'U08.9 COVID-19 anamneesis, täpsustamata\n' +
        'U09 COVID-19 järgne seisund\n' +
        'U09.9 COVID-19 järgne seisund, täpsustamata\n' +
        'U10 COVID-19 tekkeline süsteemne põletikuline sündroom\n' +
        'U10.9 COVID-19 tekkeline süsteemne põletikuline sündroom, täpsustamata\n' +
        'U11 Immuniseerimise vajadus COVID-19 vastu\n' +
        'U11.9 Immuniseerimise vajadus COVID-19 vastu, täpsustamata\n' +
        'U12 COVID-19 vaktsiini põhjustatud soovimatu mõju\n' +
        'U12.9 COVID-19 vaktsiini põhjustatud soovimatu mõju, täpsustamata\n' +
        '\n' +
        'Parandati järgmiste koodide nimetusi:\n' +
        'D69.3 Idiopaatiline mittetrombotsütopeeniline purpur -> Idiopaatiline trombotsütopeeniline purpur\n' +
        'C79.0 Neeru ja neeruvagna metastaatiline pahaloomuline kasvaja -> Neeru ja neeruvaagna metastaatiline pahaloomuline kasvaja\n' +
        'S06.7 Kolijusisene vigastus pikema kooma [meelemarkusetusega] -> Koljusisene vigastus pikema kooma [meelemärkusetusega]\n' +
        '\n' +
        'Lisaks on eelmise (7.) versiooni järgselt arendajatelt laekunud tagasiside alusel parandatud XMLi struktuuri järgmistes failides A00-B99.xml, C00-D48.xml, E00-E90.xml, F00-F99.xml, N00-N99.xml, P00-P99.xml, S00-T98.xml, V01-Y99.xml. Antud parandused ei ole seotud koodide sisuliste muudatustega, vaid mõjutasid XMLide importi.\n' +
        '\n' +
        'Muudatus- ja täiendusettepanekud edastada klassifikaatori sisu haldajale, Sotsiaalministeeriumile aadressil info@sm.ee.Publitseeritud failidega seotud küsimused edastage palun andmekorraldus@tehik.ee.'
    };
    return {'int': int, 'est': est}[edition] as any;
  }
}