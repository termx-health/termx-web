import {RelatedArtifact} from 'term-web/resources/_lib/relatedartifacts';

export class RelatedArtifactUtil {

  public static getUrl(artifact: RelatedArtifact): string {
    const type = artifact.type;
    const id = artifact.id;

    if (type === 'CodeSystem') {
      return '/resources/code-systems/' + id + '/view'; //todo: replace with summary when summary component will be ready
    }
    if (type === 'ValueSet') {
      return '/resources/value-sets/' + id + '/summary';
    }

    return '';
  }
}
