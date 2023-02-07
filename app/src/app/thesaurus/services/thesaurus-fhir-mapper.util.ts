import {ElementDefinition} from 'fhir/model/element-definition';
import {isDefined} from '@kodality-web/core-util';

export class ThesaurusFhirMapperUtil {
  public static mapToKeyValue(fhirObj: any): {[key: string]: any} {
    if (fhirObj.resourceType === 'StructureDefinition' && isDefined(fhirObj)) {
      return ThesaurusFhirMapperUtil.mapFromStructureDefinition(fhirObj);
    }
    return {};
  }

  private static mapFromStructureDefinition(structureDefinition: any): {[key: string]: any} {
    const res: {[key: string]: any} = {};
    if (structureDefinition.snapshot) {
      res[structureDefinition!.name!] = ThesaurusFhirMapperUtil.mapSnapshot(structureDefinition.snapshot.element);
    } if (structureDefinition.differential) {
      res[structureDefinition!.name!] = ThesaurusFhirMapperUtil.mapDifferential(structureDefinition.differential.element, res[structureDefinition!.name!]);
    }
    res[structureDefinition!.name]['rootProperties'] = {mapping: structureDefinition.mapping};
    return res;
  }

  private static mapSnapshot(element: ElementDefinition[]): {[key: string]: any} {
    let res: {[key: string]: any} = {};
    element?.forEach(el => {
      const ids = el.id!.split(/\.|:/);
      ids.shift();
      res = Object.assign(res, ThesaurusFhirMapperUtil.appendKey(ids, el, res, 'snap'));
    });
    return res;
  }

  private static mapDifferential(element: ElementDefinition[], res: {[key: string]: any}): {[key: string]: any} {
    res = res || {};
    element?.forEach(el => {
      const ids = el.id!.split(/\.|:/);
      ids.shift();
      res = Object.assign(res, ThesaurusFhirMapperUtil.appendKey(ids, el, res, 'diff'));
    });
    return res;
  }

  private static appendKey(array: string[], el: any, res: {[key: string]: any}, type: 'snap' | 'diff'): {[key: string]: any} {
    if (array.length === 1) {
      if (type === 'snap') {
        res[array[0]] = res[array[0]]?.snap ? res[array[0]] : Object.assign(res[array[0]] || {}, {snap: el});
      }
      if (type === 'diff') {
        res[array[0]] = res[array[0]]?.diff ? res[array[0]] : Object.assign(res[array[0]] || {}, {diff: el});
      }
    } else if (array.length > 1) {
      const key = array.shift()!;
      if (type === 'snap') {
        res[key] = res[key]?.snap ? res[key] : Object.assign(res[key] || {}, {snap: el});
      }
      if (type === 'diff') {
        res[key] = res[key]?.diff ? res[key] : Object.assign(res[key] || {}, {diff: el});
      }
      const children = ThesaurusFhirMapperUtil.appendKey(array, el, res[key], type);
      Object.keys(children).forEach(child => res[key][child] = children[child]);
    }
    return res;
  }
}
