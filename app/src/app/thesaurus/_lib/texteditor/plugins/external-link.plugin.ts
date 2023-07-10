export default function getLink(combinedLink: string, ctx: {spaceId?: number}): string {
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
      return ctx.spaceId ? `/thesaurus/${ctx.spaceId}/${value}` : `/thesaurus/${value}`;
    default:
      return combinedLink;
  }
};
