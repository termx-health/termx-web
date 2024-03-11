import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {collect, DestroyService, group, isNil} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {combineLatest, forkJoin, map, Observable, of, takeUntil} from 'rxjs';
import {SpaceContextComponent} from 'term-web/core/context/space-context.component';
import {PackageResource, TerminologyServer, TerminologyServerLibService} from 'term-web/space/_lib';
import {JobLibService} from 'term-web/sys/_lib';
import {FhirCodeSystemLibService, FhirConceptMapLibService, FhirValueSetLibService} from '../../../fhir/_lib';
import {PackageResourceService} from '../../services/package-resource.service';

export class SpaceDiffItem {
  public resource?: PackageResource;
  public resourceType?: string;
}

@Component({
  templateUrl: './space-diff.component.html',
  providers: [DestroyService]
})
export class SpaceDiffComponent implements OnInit {
  public loading: boolean;
  public current: string;
  public comparable: string;
  public diffItem: SpaceDiffItem = {};
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
    public ctx: SpaceContextComponent,
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
    this.loadResource(id).subscribe(current => {
      this.current = current;
      this.loadServerResource(JSON.parse(current).id, serverCode).subscribe(comparable => {
        this.comparable = comparable;
      });
    }).add(() => this.loading = false);
  }


  private loadData(): void {
    combineLatest([
      this.ctx.space$.pipe(takeUntil(this.destroy$)),
      this.ctx.pack$.pipe(takeUntil(this.destroy$)),
      this.ctx.version$.pipe(takeUntil(this.destroy$)),
      this.route.queryParamMap
    ]).subscribe(([s, p, v, params]) => {
      forkJoin([
        this.terminologyServerService.search({spaceId: s?.id, limit: -1}),
        this.packageResourceService.loadAll(s?.id, p?.code, v?.version)
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

  public sync(type: 'local' | 'external'): void {
    const resourceId = this.diffItem?.resource?.id;
    if (resourceId) {
      this.loading = true;
      this.packageResourceService.sync(resourceId, type).subscribe({
        next: (resp) => this.pollJobStatus(resp.jobId as number),
        error: () => this.loading = false
      });
    }
  }

  private pollJobStatus(jobId: number): void {
    this.jobService.pollFinishedJobLog(jobId, this.destroy$).subscribe(jobResp => {
      if (!jobResp.errors) {
        this.notificationService.success("web.space.resource-import-success-message");
        this.loadData();
      } else {
        this.notificationService.error("web.space.resource-import-error-message", jobResp.errors.join(","), {duration: 0, closable: true});
      }
    }).add(() => this.loading = false);
  }

  protected normalize(json: string): string {
    if (isNil(json)) {
      return null;
    }
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch (e) {
      return json;
    }
  }
}
