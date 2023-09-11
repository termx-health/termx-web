export interface WikiAbstractEditor {
  /**
   * aka. the last cursor position, if focus exited the editor.
   */
  get cursorPosition(): number;

  insertAtCursorPosition(pos: number, content: string): void;

  setCursorPosition(pos: number): void;

  replaceRangeWith(from: number, to: number, content: string): void;
}
