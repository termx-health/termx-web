import {ValueSet, ValueSetVersion} from '../../_lib';
import {Resource} from '../model/resource';
import {isDefined} from '@kodality-web/core-util';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';

export class ResourceUtil {

  public static fromValueSet(vs: ValueSet): Resource {
    if (!isDefined(vs)) {
      return undefined;
    }
    return {
      id: vs.id,
      uri: vs.uri,
      title: vs.title,
      name: vs.name,
      publisher: vs.publisher,
      description: vs.description,
      purpose: vs.purpose,
      experimental: vs.experimental
    };
  }

  public static mergeValueSet(vs: ValueSet, r: Resource): void {
    vs.id = r.id;
    vs.uri = r.uri;
    vs.title = r.title;
    vs.name = r.name;
    vs.publisher = r.publisher;
    vs.description = r.description;
    vs.purpose = r.purpose;
    vs.experimental = r.experimental;
  };

  public static fromValueSetVersion(vsv: ValueSetVersion): ResourceVersion {
    if (!isDefined(vsv)) {
      return undefined;
    }
    return {
      status: vsv.status,
      version: vsv.version,
      algorithm: vsv.algorithm,
      from: vsv.releaseDate,
      to: vsv.expirationDate,
      description: vsv.description,
      supportedLanguages: vsv.supportedLanguages
    }
  }

  public static toValueSetVersion(rv: ResourceVersion): ValueSetVersion {
    if (!isDefined(rv)) {
      return undefined;
    }
    const v = new ValueSetVersion();
    v.status = rv.status;
    v.version = rv.version;
    v.algorithm = rv.algorithm;
    v.releaseDate = rv.from;
    v.expirationDate = rv.to;
    v.description = rv.description;
    v.supportedLanguages = rv.supportedLanguages;
    return v;
  }
}
