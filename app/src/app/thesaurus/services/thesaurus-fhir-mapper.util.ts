import {ElementDefinition} from 'fhir/model/element-definition';
import {isDefined} from '@kodality-web/core-util';

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
      res[array[0]] = {
        type: el.type?.[0].code,
        targetProfiles: el.type?.[0].targetProfile,
        fixed: el.fixedUri,
        cardinality: isDefined(el.min) || isDefined(el.max) ? (isDefined(el.min) ? el.min : '*') + '..' + (isDefined(el.max) ? el.max : '*') : '',
        short: el.short,
        definition: isDefined(el.definition) && el.definition !== el.short ? el.definition : undefined,
        binding: isDefined(el.binding) ? el.binding.valueSet : undefined,
        bindingStrength: isDefined(el.binding) ?  el.binding.strength : undefined
      };
    } else if (array.length > 1) {
      res[array.shift()!] = Object.assign(res[array.shift()!] || {} , ThesaurusFhirMapperUtil.appendKey(array, el));
    }
    return res;
  }
}
