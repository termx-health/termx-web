import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Package, PackageVersion, Project, ProjectLibService} from 'terminology-lib/project';

@Injectable()
export class ProjectService extends ProjectLibService {
  public save(project: Project): Observable<Project> {
    if (project.id) {
      return this.http.put<Project>(`${this.baseUrl}/${project.id}`, project);
    }
    return this.http.post<Project>(`${this.baseUrl}`, project);
  }

  public savePackage(req: {pack: Package, version: PackageVersion}, projectId: number): Observable<Package> {
    return this.http.post<Project>(`${this.baseUrl}/${projectId}/packages`, req);
  }


}
