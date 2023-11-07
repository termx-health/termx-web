import {isDefined} from '@kodality-web/core-util';
import {Element} from 'term-web/modeler/_lib';

export class StructureDefinitionUtil {

  public static changeId(prevId: string, newId: string, elements: Element[]): void {
    const el = elements?.find(e => e.id === prevId);
    if (isDefined(el)) {
      el.id = newId;
      el.path = newId;
      elements[elements.indexOf(el)] = el;
    }

    const subElements = elements?.filter(e => {
      if (!e.path.startsWith(prevId)) {
        return false;
      }
      const subElId = e.path.replace(prevId, '');
      return subElId.startsWith('.');
    });

    subElements?.forEach(subEl => {
      subEl.id = subEl.id.replace(prevId, newId);
      subEl.path = subEl.path.replace(prevId, newId);
      elements[elements.indexOf(subEl)] = subEl;
    });
  }
}
