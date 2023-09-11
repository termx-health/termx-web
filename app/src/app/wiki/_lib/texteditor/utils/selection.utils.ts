export function contentFromSelection(text: string, pos: number, startToken: string, endToken: string) {
  const startPos = text.lastIndexOf(startToken, pos);
  const endPos = text.indexOf(endToken, pos);
  if (
    text.slice(startPos, startPos + startToken.length) !== startToken ||
    text.slice(endPos, endPos + endToken.length) !== endToken ||
    text.slice(startPos + startToken.length, pos).includes(endToken) ||
    text.slice(pos, endPos - endToken.length).includes(startToken)
  ) {
    return {};
  }
  const selection = text.substring(startPos, endPos + endToken.length);
  return {
    selection,
    startPos,
    endPos,
  };
}
