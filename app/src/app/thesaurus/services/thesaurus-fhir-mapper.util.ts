import {StructureDefinition} from 'fhir/model/structure-definition';
import {ElementDefinition} from 'fhir/model/element-definition';

export class ThesaurusFhirMapperUtil {
  public static mapToKeyValue(fhirObj: any): {[key: string]: any} {
    if (fhirObj.resourceType === 'StructureDefinition') {
      return ThesaurusFhirMapperUtil.mapFromStructureDefinition(fhirObj);
    }
    return {};
  }

  private static mapFromStructureDefinition(structureDefinition: StructureDefinition): {[key: string]: any} {
    const res: {[key: string]: any} = {};
    res[structureDefinition!.type!] = ThesaurusFhirMapperUtil.mapFromElementDefinition(structureDefinition.differential!.element);
    return res;
  }

  private static mapFromElementDefinition(element: ElementDefinition[]): {[key: string]: any} {
    let res: {[key: string]: any} = {};
    element.forEach(el => {
      const ids = el.id!.split(/\.|:/);
      ids.shift();
      res = Object.assign(res, ThesaurusFhirMapperUtil.appendKey(ids, el.type?.[0].code));
    });
    return res;
  }

  private static appendKey(array: string[], type?: string): {[key: string]: any} {
    const res: {[key: string]: any} = {};
    if (array.length === 1) {
      res[array[0]] = {description: type};
    } else if (array.length > 1) {
      res[array.shift()!] = Object.assign(res[array.shift()!] || {} , ThesaurusFhirMapperUtil.appendKey(array, type));
    }
    return res;
  }
}
