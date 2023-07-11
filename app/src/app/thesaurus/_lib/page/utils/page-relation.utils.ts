export function parsePageRelationLink(link: string): {page: string, space?: string} {
  const [page, space] = link.split(/\/(.*)/s).slice(0, 2).reverse();
  return {page, space};
}

