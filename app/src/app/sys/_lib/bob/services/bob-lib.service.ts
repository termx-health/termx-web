import {HttpClient, HttpEvent, HttpEventType, HttpResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {QueryParams, SearchHttpParams, SearchResult} from '@termx-health/core-util';
import {environment} from 'environments/environment';
import {EMPTY, mergeMap, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {BobObject} from 'term-web/sys/_lib/bob/model/bob-object';

/**
 * Thin wrapper over the generic {@code /bob/objects} REST surface (see termx-server Phase 1a).
 * Container-specific authz lives server-side; the UI simply passes {@code container} on every
 * call and the server's {@code BobContainerAuthorizer} plugin enforces read/write privileges.
 */
@Injectable()
export class BobLibService {
  protected http = inject(HttpClient);
  protected baseUrl = `${environment.termxApi}/bob/objects`;

  public query(container: string, params: QueryParams & {meta?: any} = new QueryParams()): Observable<SearchResult<BobObject>> {
    const httpParams: {[k: string]: any} = {...params, container};
    if (params.meta && typeof params.meta !== 'string') {
      httpParams['meta'] = JSON.stringify(params.meta);
    }
    return this.http.get<SearchResult<BobObject>>(this.baseUrl, {params: SearchHttpParams.build(httpParams)});
  }

  public load(uuid: string): Observable<BobObject> {
    return this.http.get<BobObject>(`${this.baseUrl}/${uuid}`);
  }

  public contentUrl(uuid: string): string {
    return `${this.baseUrl}/${uuid}/content`;
  }

  /**
   * Streaming upload — the server uses {@code StreamingFileUpload} + a temp file, so even
   * multi-hundred-MB archives don't OOM the JVM. The Observable emits intermediate
   * {@code {finished:false, progress: 0-100}} events while bytes upload, then a final
   * {@code {finished:true, body: BobObject}} when the server responds.
   */
  public upload(opts: {
    container: string;
    file: Blob;
    filename?: string;
    meta?: {[k: string]: any};
    description?: string;
    path?: string;
    contentType?: string;
  }): Observable<{finished: boolean; progress?: number; body?: BobObject}> {
    const fd = new FormData();
    fd.append('container', opts.container);
    fd.append('file', opts.file, opts.filename || (opts.file as File).name || 'upload');
    if (opts.meta) {
      fd.append('meta', JSON.stringify(opts.meta));
    }
    if (opts.description) {
      fd.append('description', opts.description);
    }
    if (opts.path) {
      fd.append('path', opts.path);
    }
    if (opts.contentType) {
      fd.append('contentType', opts.contentType);
    }
    return this.http.post<BobObject>(this.baseUrl, fd, {reportProgress: true, observe: 'events'})
        .pipe(mergeMap((event: HttpEvent<BobObject>) => {
          if (event.type === HttpEventType.UploadProgress) {
            return of({finished: false, progress: event.total ? Math.round(100 * event.loaded / event.total) : 0});
          } else if (event instanceof HttpResponse) {
            return of({finished: true, body: event.body as BobObject});
          }
          return EMPTY;
        }));
  }

  public update(uuid: string, patch: {meta?: any; description?: string}): Observable<BobObject> {
    return this.http.patch<BobObject>(`${this.baseUrl}/${uuid}`, patch);
  }

  public delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${uuid}`);
  }
}
