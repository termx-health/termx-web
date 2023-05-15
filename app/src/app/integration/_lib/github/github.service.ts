import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {environment} from 'app/src/environments/environment';

@Injectable({providedIn: 'root'})
export class GithubService {

  private baseUrl = `${environment.terminologyApi}/github`;

  public constructor(
    private http: HttpClient
  ) {
  }

  public authenticateApp(state: string): void {
    this.http.post(`${this.baseUrl}/authorize`, {"state": state}).subscribe((resp: any) => {
      window.location.href = resp.redirectUri;
    });
  }

  public listInstallations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/installations`);
  }

  public listRepos(installationId: number): Observable<any[]> {
    return this.http.get(`${this.baseUrl}/repositories?installationId=${installationId}`).pipe(map(resp => resp as any[]));
  }

  public export(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/export`, data);
  }

}

export class GithubExportable {
  public filename?: string;
  public content?: string;
}
