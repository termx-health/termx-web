import {Component, OnInit} from '@angular/core';
import {TerminologyServer, TerminologyServerLibService} from 'lib/src/project';
import {forkJoin, map, Observable, of} from 'rxjs';
import {DestroyService} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirValueSetLibService} from 'terminology-lib/fhir';
import {diffWords} from 'diff';

export class ProjectDiffItem {
  public resourceId?: string;
  public resourceType?: string;
  public server?: TerminologyServer;
}

@Component({
  templateUrl: './project-diff.component.html',
  providers: [DestroyService]
})
export class ProjectDiffComponent implements OnInit {
  public loading: boolean;
  public current: string;
  public comparable: string;
  public diffItem: ProjectDiffItem = {};
  public terminologyServers: TerminologyServer[];

  public constructor(
    private fhirCSService: FhirCodeSystemLibService,
    private fhirVSService: FhirValueSetLibService,
    private fhirCMService: FhirConceptMapLibService,
    private terminologyServerService: TerminologyServerLibService,
    private route: ActivatedRoute,) {}

  public ngOnInit(): void {
    this.loadTerminologyServers();

    this.route.queryParamMap.subscribe(queryParamMap => {
      this.diffItem.resourceType = queryParamMap.get('resourceType') || undefined;
      this.diffItem.resourceId = queryParamMap.get('resourceId') || undefined;
      this.loading = true;
      this.loadResource(this.diffItem.resourceId).subscribe(r => this.current = r).add(() => this.loading = false);
    });

  }

  private loadResource(id: string, url?: string): Observable<string> {
    if (id && this.diffItem.resourceType === 'code-system') {
      return this.fhirCSService.loadCodeSystem(id, undefined, url).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    if (id && this.diffItem.resourceType === 'value-set') {
      return this.fhirVSService.loadValueSet(id, undefined, url).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    if (id && this.diffItem.resourceType === 'map-set') {
      return this.fhirCMService.loadConceptMap(id, undefined, url).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    return of(null);
  }

  public loadServerResource(id: string, url: string): void {
    if (!url) {
      return;
    }
    this.loading = true;
    this.loadResource(id, url).subscribe(r => this.comparable = r).add(() => {
      this.compare();
      this.loading = false;
    });
  }

  public loadResources(id: string): void {
    this.loading = true;
    forkJoin([
      this.loadResource(id),
      this.loadResource(id, this.diffItem.server?.rootUrl)
    ]).subscribe(([current, comparable]) => {
      this.current = current;
      this.comparable = comparable;
      this.compare();
    }).add(() => this.loading = false);
  }

  public compare(): void {
    if (!this.current || !this.comparable) {
      return;
    }
    let span = null;

    const diff = diffWords(this.current, this.comparable),
      display = document.getElementById('display'),
      fragment = document.createDocumentFragment();
    display.innerHTML = '';

    diff.forEach((part) => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      span = document.createElement('span');
      span.style.color = color;
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    display.appendChild(fragment);
  }

  private loadTerminologyServers(): void {
    this.terminologyServerService.search({limit: -1}).subscribe(r => this.terminologyServers = r.data);
  }
}
