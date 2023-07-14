import {isNil} from "@kodality-web/core-util";

export function getCursorPosition(el: HTMLElement): number {
  // https://zserge.com/posts/js-editor/
  const selection = window.getSelection();
  if (isNil(selection) || selection.rangeCount === 0) {
    return undefined;
  }

  const range = selection.getRangeAt(0);
  const prefix = range.cloneRange();
  prefix.selectNodeContents(el);
  prefix.setEnd(range.endContainer, range.endOffset);
  return prefix.toString().length;
}

export function setCursorPosition(pos: number, parent: HTMLElement): number {
  // https://zserge.com/posts/js-editor/
  for (const node of [...<any>parent.childNodes]) {
    if (node.nodeType == Node.TEXT_NODE) {
      const n = node as Text;

      if (n.length >= pos) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(n, pos);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        return -1;
      } else {
        pos = pos - n.length;
      }
    } else {
      pos = setCursorPosition(pos, node);
      if (pos < 0) {
        return pos;
      }
    }
  }
  return pos;
}
