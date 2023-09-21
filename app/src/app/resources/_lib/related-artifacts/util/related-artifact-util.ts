import {RelatedArtifact} from 'app/src/app/resources/_lib/related-artifacts';

export class RelatedArtifactUtil {

  public static getCommands(artifact: RelatedArtifact): any[] {
    const type = artifact.type;
    const id = artifact.id;

    if (type === 'CodeSystem') {
      return ['/resources/code-systems/' + id + '/summary'];
    }
    if (type === 'ValueSet') {
      return ['/resources/value-sets/' + id + '/summary'];
    }
    if (type === 'MapSet') {
      return ['/resources/map-sets/' + id + '/summary'];
    }
    if (type === 'Page') {
      const s = id.split('|');
      return ['/wiki/' + s[0] + '/' + s[1]];
    }
    if (type === 'Space') {
      const s = id.split('|');
      return ['/spaces/context', {s: s[1]}];
    }
    return [''];
  }
}
