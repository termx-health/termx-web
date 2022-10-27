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
    element?.forEach(el => {
      const ids = el.id!.split(/\.|:/);
      ids.shift();
      res = Object.assign(res, ThesaurusFhirMapperUtil.appendKey(ids, el, res));
    });
    return res;
  }

  private static appendKey(array: string[], el: any, res: {[key: string]: any}): {[key: string]: any} {
    if (array.length === 1) {
      res[array[0]] = res[array[0]] || {element: el};
    } else if (array.length > 1) {
      const key = array.shift()!;
      res[key] = res[key] || {element: el};
      const children = ThesaurusFhirMapperUtil.appendKey(array, el, res[key]);
      Object.keys(children).forEach(child => res[key][child] = children[child]);
    }
    return res;
  }
}
