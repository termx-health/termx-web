import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
import {Template, TemplateLibService} from 'term-web/wiki/_lib';

@Injectable()
export class TemplateService extends TemplateLibService {

  public saveTemplate(template: Template): Observable<Template> {
    if (isDefined(template.id)) {
      return this.http.put(`${this.baseUrl}/templates/${template.id}`, template);
    }
    return this.http.post(`${this.baseUrl}/templates`, template);
  }

  public deleteTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/templates/${id}`);
  }
}
