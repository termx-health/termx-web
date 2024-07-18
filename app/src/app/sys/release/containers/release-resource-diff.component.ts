import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DestroyService, group, isNil, LoadingManager} from '@kodality-web/core-util';
import {MuiNotificationService} from '@kodality-web/marina-ui';
import {map, Observable, of, forkJoin} from 'rxjs';
import {FhirCodeSystemLibService, FhirValueSetLibService} from 'term-web/fhir/_lib';
import {TerminologyServer, TerminologyServerLibService} from 'term-web/sys/_lib/space';
import {ReleaseResource, Release} from 'app/src/app/sys/_lib';
import {ReleaseService} from 'term-web/sys/release/services/release.service';

@Component({
  templateUrl: './release-resource-diff.component.html',
  providers: [DestroyService]
})
export class ReleaseResourceDiffComponent implements OnInit {
  public current: string;
  public comparable: string;

  public release: Release;
  public resource: ReleaseResource;

  public terminologyServers: {[key: string]: TerminologyServer};

  public loader = new LoadingManager();

  public constructor(
    private fhirCSService: FhirCodeSystemLibService,
    private fhirVSService: FhirValueSetLibService,
    private terminologyServerService: TerminologyServerLibService,
    private releaseService: ReleaseService,
    private notificationService: MuiNotificationService,
    private destroy$: DestroyService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.loader.wrap('load-data', forkJoin([this.releaseService.load(Number(id)), this.terminologyServerService.search({limit: -1})]))
      .subscribe(([release, servers]) => {
        this.release = release;
        this.terminologyServers = group(servers.data, s => s.code);

        const resourceId = this.route.snapshot.paramMap.get('resourceId');
        this.resource = release.resources?.find(r => r.id === Number(resourceId));
        this.loadFhirResources();
      });
  }

  private loadResource(): Observable<string> {
    if (isNil(this.resource?.resourceId)) {
      return of(null);
    }
    const id = this.resource.resourceId + (this.resource.resourceVersion ? '--' + this.resource.resourceVersion : '');
    if (this.resource.resourceType === 'CodeSystem') {
      return this.fhirCSService.loadCodeSystem(id).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    if (this.resource.resourceType === 'ValueSet') {
      return this.fhirVSService.loadValueSet(id).pipe(map(r => JSON.stringify(r, null, 2)));
    }
    return of(null);
  }

  private loadServerResource(id: string, code: string): Observable<string> {
    if (!id || !code) {
      return of(null);
    }
    const request = {serverCode: code, resourceId: id, resourceType: this.resource.resourceType};
    return this.terminologyServerService.loadResource(request).pipe(map(r => r.resource));
  }

  public loadFhirResources(): void {
    this.current = undefined;
    this.comparable = undefined;
    this.loader.wrap('load-resource', this.loadResource()).subscribe(current => {
      this.current = current;
      this.loadServerResource(JSON.parse(current).id, this.release.terminologyServer).subscribe(comparable => this.comparable = comparable);
    });
  }

  public sync(): void {
    this.loader.wrap('sync', this.releaseService.serverSync(this.release.id, this.destroy$, this.resource.id)).subscribe(resp => {
      if (!resp.errors) {
        this.notificationService.success("web.space.resource-import-success-message");
        this.loadFhirResources();
      } else {
        this.notificationService.error("web.space.resource-import-error-message", resp.errors.join(","), {duration: 0, closable: true});
      }
    });
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
