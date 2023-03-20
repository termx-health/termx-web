import {Component, OnInit} from '@angular/core';
import {PackageResource, TerminologyServer, TerminologyServerLibService} from 'lib/src/project';
import {combineLatest, filter, forkJoin, map, merge, Observable, of, Subject, switchMap, takeUntil, timer} from 'rxjs';
import {collect, DestroyService, group} from '@kodality-web/core-util';
import {ActivatedRoute} from '@angular/router';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirValueSetLibService, JobLibService} from '@terminology/core';
import {diffWords} from 'diff';
import {ProjectContextComponent} from '../../../core/context/project-context.component';
import {PackageResourceService} from '../../services/package-resource.service';
import {MuiNotificationService} from '@kodality-web/marina-ui';

export class ProjectDiffItem {
  public resource?: PackageResource;
  public resourceType?: string;
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
  public terminologyServers: {[key: string]: TerminologyServer};
  public serverEditable: boolean;
  public resources: {[key: string]: PackageResource[]};

  public constructor(
    private fhirCSService: FhirCodeSystemLibService,
    private fhirVSService: FhirValueSetLibService,
    private fhirCMService: FhirConceptMapLibService,
    private terminologyServerService: TerminologyServerLibService,
    private packageResourceService: PackageResourceService,
    private jobService: JobLibService,
    private notificationService: MuiNotificationService,
    public ctx: ProjectContextComponent,
    private destroy$: DestroyService,
    private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.loadData();
  }

  private loadResource(id: string): Observable<string> {
    if (id && this.diffItem.resourceType === 'code-system') {
      return this.fhirCSService.loadCodeSystem(id).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    if (id && this.diffItem.resourceType === 'value-set') {
      return this.fhirVSService.loadValueSet(id).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    if (id && this.diffItem.resourceType === 'map-set') {
      return this.fhirCMService.loadConceptMap(id).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    return of(null);
  }

  private loadServerResource(id: string, code: string): Observable<string> {
    if (!id || !code) {
      return of(null);
    }
    const request = {serverCode: code, resourceId: id, resourceType: this.diffItem.resourceType};
    return this.terminologyServerService.loadResource(request).pipe(map(r => r.resource));
  }

  public loadResources(resource: PackageResource): void {
    this.current = undefined;
    this.comparable = undefined;
    if (!resource) {
      return;
    }

    const id = resource.resourceId;
    const serverCode = resource.terminologyServer;

    this.loading = true;
    forkJoin([
      this.loadResource(id),
      this.loadServerResource(id, serverCode)
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

    let different = false;
    diff.forEach((part) => {
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      different = different || ((part.added || part.removed) && part.value.trim() !== '');
      span = document.createElement('span');
      span.style.color = color;
      span.appendChild(document.createTextNode(part.value));
      fragment.appendChild(span);
    });

    if (different) {
      display.appendChild(fragment);
    }
  }

  private loadData(): void {
    combineLatest([
      this.ctx.project$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$)),
      this.route.queryParamMap
    ]).subscribe(([pr, p, v, params]) => {
      forkJoin([
        this.terminologyServerService.search({projectId: pr?.id, limit: -1}),
        this.packageResourceService.loadAll(pr?.code, p?.code, v?.version)
      ]).subscribe(([servers, resources]) => {
        this.terminologyServers = group(servers.data, s => s.code);
        this.resources = collect(resources, r => r.resourceType);
        this.diffItem.resourceType = params.get('resourceType') || undefined;
        this.diffItem.resource = this.resources[this.diffItem.resourceType].find(r => r.resourceId === params.get('resourceId'));
        this.loadResources(this.diffItem.resource);
      });
    });
  }

  public serverSelected(serverCode: string): void {
    const resource = this.diffItem.resource;
    resource.terminologyServer = serverCode;
    this.packageResourceService.update(resource.id, resource.versionId, resource).subscribe(r => {
      this.loadResources(r);
      this.serverEditable = false;
    });
  }

  public sync(): void {
    const resourceId =this.diffItem?.resource?.id;
    if (resourceId) {
      this.loading = true;
      this.packageResourceService.sync(resourceId).subscribe({
        next: (resp) => this.pollJobStatus(resp.jobId as number),
        error: () => this.loading = false
      });
    }
  }

  private pollJobStatus(jobId: number): void {
    const stopPolling$ = new Subject<void>();
    timer(0, 3000).pipe(
      takeUntil(merge(this.destroy$, stopPolling$)),
      switchMap(() => this.jobService.getLog(jobId)),
      filter(resp => resp.execution?.status !== 'running')
    ).subscribe(jobResp => {
      stopPolling$.next();
      if (!jobResp.errors) {
        this.notificationService.success("web.project.resource-import-success-message");
        this.loadData();
      } else {
        this.notificationService.error("web.project.resource-import-error-message", jobResp.errors.join(","), {duration: 0, closable: true});
      }
    }).add(() => this.loading = false);
  }
}
