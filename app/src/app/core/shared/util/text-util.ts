export class TextUtil {
  private static from = Array.from('äąęėõöüųūįšžč');
  private static to   = Array.from('aaeeoouuuiszc');

  public static searchTranslate(text: string): string {
    let result = text.toLowerCase();
    TextUtil.from.forEach((s, i) => result = result.replace(s, TextUtil.to[i]));
    return result;
  }
}
