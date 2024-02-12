export class UriUtil {

  public static encodeUriAll(uri: string): string {
    return uri.replace(/[^A-Za-z0-9]/g, c =>
      `%${c.charCodeAt(0).toString(16).toUpperCase()}`
    );
  }
}
