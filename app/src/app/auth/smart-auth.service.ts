import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {map, mergeMap, Observable, of, timer} from 'rxjs';
import * as uuid from 'uuid';


interface SmartConf {
  iss: SmartIssConf;
  state?: string;
  auth?: {
    access_token: string;
    expires_in: number;
  };
  expiresAt?: Date;
}

interface SmartIssConf {
  iss: string;
  authUrl: string;
  tokenUrl: string;
  introspectUrl: string;
}

@Injectable({providedIn: 'root'})
export class SmartAuthService {

  public constructor(protected http: HttpClient) {
  }

  public getAuthToken(): string | undefined {
    return this.getSmartState()?.auth?.access_token;
  }

  public getSmartState(): SmartConf | undefined {
    const state = window.localStorage.getItem('smart');
    return state ? JSON.parse(state) as SmartConf : undefined;
  }

  private setState(conf: SmartConf): void {
    window.localStorage.setItem('smart', JSON.stringify(conf));
  }

  public checkAuth(): Observable<boolean> {
    const url = new URL(window.location.href);

    if (url.searchParams.has('iss') && url.searchParams.has('launch')) {
      this.launch(url.searchParams.get('iss')!, url.searchParams.get('launch')!);
      return timer(10000).pipe(map(() => false)); //should redirect. need to wait
    }
    if (url.searchParams.has('code') && url.searchParams.has('state')) {
      const code = url.searchParams.get('code')!;
      const state = url.searchParams.get('state')!;
      if (this.getSmartState()?.state !== state) {
        return of(false);
      }
      return this.login(state, code).pipe(mergeMap(() => {
        window.location.href = '/';
        return timer(10000).pipe(map(() => false)); //should redirect. need to wait
      }));
    }
    if (!this.getAuthToken()) {
      return of(false);
    }
    if (!this.getSmartState()?.expiresAt || this.getSmartState()?.expiresAt! < new Date()) {
      return of(false);
    }
    return of(true);
  }

  private launch(iss: string, launch: string): void {
    this.loadMeta(iss).subscribe(issConf => {
      const state = uuid.v4();

      const smartState = {iss: issConf, state: state};
      this.setState(smartState);

      const params: {[key: string]: string} = {
        client_id: 'terminology',
        response_type: 'code',
        scope: 'system/CodeSystem.read system/ValueSet.read',
        redirect_uri: window.location.origin,
        state: state,
        aud: iss,
        launch: launch
      };
      const redirect = `${smartState.iss.authUrl}?` + Object.keys(params).map(k => k + '=' + encodeURIComponent(params[k])).join('&');
      window.location.href = redirect;
      // @ts-ignore
      const a = 1 / 0;
    });
  }

  private login(state: string, code: string): Observable<SmartConf> {
    const conf = this.getSmartState();
    if (!conf || conf.state !== state) {
      return of(null as any); //TODO: error;
    }
    const params = new URLSearchParams();
    params.set('cliend_id', 'terminology');
    params.set('grant_type', 'authorization_code');
    params.set('redirect_uri', window.location.origin);
    params.set('code', code);
    return this.http.post(conf.iss.tokenUrl, params.toString(), {headers: new HttpHeaders({'Content-Type': 'application/x-www-form-urlencoded'})})
      .pipe(map(resp => {
        conf.auth = resp as any;
        const expires = new Date();
        expires.setSeconds(expires.getSeconds() + conf.auth?.expires_in!);
        conf.expiresAt = expires;
        this.setState(conf);
        return conf;
      }));
  }

  private loadMeta(iss: string): Observable<SmartIssConf> {
    return this.http.get(`${iss}/metadata`).pipe(
      map(metadata => {
        const extension = 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris';
        const urls = (metadata as any).rest[0].security.extension.find((ex: any) => ex.url === extension).extension;
        return {
          iss: iss,
          authUrl: urls.find((ex: any) => ex.url === 'authorize').valueUri,
          tokenUrl: urls.find((ex: any) => ex.url === 'token').valueUri,
          introspectUrl: urls.find((ex: any) => ex.url === 'introspect').valueUri
        };
      })
    );
  }

}
