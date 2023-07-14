export function tokenAttrValue(token, attr): string {
  return token.attrs.find(a => a[0] === attr)?.[1];
}
