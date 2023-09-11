export function tokenAttrValue(token, attr): [string, (val: string) => void] {
  const attrIdx = token.attrs.findIndex(a => a[0] === attr)
  if (attrIdx === -1) {
    return [undefined, (val): void => { token.attrs.push(attr, val); }];
  }
  return [token.attrs[attrIdx][1], (val): void => {token.attrs[attrIdx][1] = val}];
}
