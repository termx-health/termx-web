import {Injectable} from '@angular/core';
import {ThesaurusLibService} from 'terminology-lib/thesaurus/services/thesaurus-lib.service';
import {Observable} from 'rxjs';
import {isDefined} from '@kodality-web/core-util';
import {Page, PageContent, StructureDefinition} from 'terminology-lib/thesaurus';

@Injectable()
export class ThesaurusService extends ThesaurusLibService {

  public savePage(page: Page, pageContent: PageContent): Observable<Page> {
    if (isDefined(page.id)) {
      return this.http.put(`${this.baseUrl}/pages/${page.id}`, {page: page, content: pageContent});
    }
    return this.http.post(`${this.baseUrl}/pages`, {page: page, content: pageContent});
  }

  public savePageContent(content: PageContent, pageId: number): Observable<PageContent> {
    if (isDefined(content.id)) {
      return this.http.put(`${this.baseUrl}/pages/${pageId}/contents/${content.id}`, content);
    }
    return this.http.post(`${this.baseUrl}/pages/${pageId}/contents`, content);
  }

  public saveStructureDefinition(structureDefinition: StructureDefinition): Observable<StructureDefinition> {
    if (isDefined(structureDefinition.id)) {
      return this.http.put(`${this.baseUrl}/structure-definitions/${structureDefinition.id}`, structureDefinition);
    }
    return this.http.post(`${this.baseUrl}/structure-definitions`, structureDefinition);
  }

  public deleteStructureDefinition(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/structure-definitions/${id}`);
  }
}
