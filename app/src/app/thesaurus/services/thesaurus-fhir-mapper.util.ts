import {ElementDefinition} from 'fhir/model/element-definition';

export class ThesaurusFhirMapperUtil {
  public static mapToKeyValue(fhirObj: any): {[key: string]: any} {
    if (fhirObj.resourceType === 'StructureDefinition') {
      return ThesaurusFhirMapperUtil.mapFromStructureDefinition(fhirObj);
    }
    return {};
  }

  private static mapFromStructureDefinition(structureDefinition: any): {[key: string]: any} {
    const res: {[key: string]: any} = {};
    res[structureDefinition!.name!] = ThesaurusFhirMapperUtil.mapFromElementDefinition(structureDefinition.differential!.element);
    return res;
  }

  private static mapFromElementDefinition(element: ElementDefinition[]): {[key: string]: any} {
    let res: {[key: string]: any} = {};
    element.forEach(el => {
      const ids = el.id!.split(/\.|:/);
      ids.shift();
      res = Object.assign(res, ThesaurusFhirMapperUtil.appendKey(ids, el));
    });
    return res;
  }

  private static appendKey(array: string[], el: any): {[key: string]: any} {
    const res: {[key: string]: any} = {};
    if (array.length === 1) {
      res[array[0]] = {type: el.type?.[0].code, cardinality: el.min && el.max ? el.min + '..' + el.max : '', description: el.short};
    } else if (array.length > 1) {
      res[array.shift()!] = Object.assign(res[array.shift()!] || {} , ThesaurusFhirMapperUtil.appendKey(array, el));
    }
    return res;
  }
}
