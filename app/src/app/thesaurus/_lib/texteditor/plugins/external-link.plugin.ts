import {parsePageRelationLink} from '../../page/utils/page-relation.utils';

export default function transformLink(combinedLink: string, ctx: {spaceId?: number}): string {
  const [system, value] = combinedLink.split(':');

  switch (system) {
    case 'cs':
      return `/resources/code-systems/${value}/summary`;
    case 'vs':
      return `/resources/value-sets/${value}/summary`;
    case 'ms':
      return `/resources/map-sets/${value}/view`;
    case 'concept':
      const [cs, concept] = value.split('|');
      return cs === 'snomed-ct'
        ? `/integration/snomed/dashboard/${concept}`
        : `/resources/code-systems/${cs}/concepts/${concept}/view`;
    case 'page':
      const {page, space} = parsePageRelationLink(value);
      if (space) {
        return `/thesaurus/${space}/${page}`;
      }
      return ctx.spaceId ? `/thesaurus/${ctx.spaceId}/${value}` : `/thesaurus/${value}`;
    default:
      return combinedLink;
  }
};
