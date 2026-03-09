import {CodeSystem, MapSet, ValueSet} from 'term-web/resources/_lib';
import {Resource} from 'term-web/resources/resource/model/resource';

export class ResourceUtil {
  public static merge(res: ValueSet | CodeSystem | MapSet, r: Resource): void {
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
