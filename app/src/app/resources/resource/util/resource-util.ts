import {CodeSystem, ValueSet, ValueSetVersion} from '../../_lib';
import {Resource} from '../model/resource';
import {isDefined} from '@kodality-web/core-util';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';

export class ResourceUtil {
  public static merge(res: ValueSet | CodeSystem, r: Resource): void {
    res.id = r.id;
    res.uri = r.uri;
    res.title = r.title;
    res.name = r.name;
    res.publisher = r.publisher;
    res.description = r.description;
    res.purpose = r.purpose;
    res.experimental = r.experimental;
  };
}
