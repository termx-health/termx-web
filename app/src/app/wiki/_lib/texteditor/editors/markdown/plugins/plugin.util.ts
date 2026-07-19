import {environment} from 'environments/environment';

// matches "files/:pageId/:fileName" (an internal page attachment reference)
export const filesRe = /^files\/(\d*)\/(.+)/;

// Resolves a "files/<id>/<name>" reference to the attachment endpoint. A browser <img>/download
// can't send the auth header, so the current token is appended as a query parameter (the server
// accepts ?token= on GET requests).
export function filesLink(url: string, token?: string): string {
  const [, id, name] = url.match(filesRe);
  const base = `${environment.termxApi}/pages/${id}/files/${name}`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export function tokenAttrValue(token, attr): [string, (val: string) => void] {
  const attrIdx = token.attrs.findIndex(a => a[0] === attr);
  if (attrIdx === -1) {
    return [undefined, (val): void => { token.attrs.push(attr, val); }];
  }
  return [token.attrs[attrIdx][1], (val): void => {token.attrs[attrIdx][1] = val;}];
}
