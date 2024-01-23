import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ImplementationGuideVersion} from '../../_lib';
import {delay, forkJoin, map, mergeMap, Observable, of, tap} from 'rxjs';
import {GithubDiff} from 'term-web/integration/_lib/github/github';
import {LoadingManager} from '@kodality-web/core-util';
import {ImplementationGuideGithubService} from '../../services/implementation-guide-github.service';
import {ImplementationGuideService} from '../../services/implementation-guide.service';
import {environment} from 'environments/environment';

@Component({
  templateUrl: './implementationguide-github.component.html',
  styles: [`
    .status-row {
      display: flex;

      & .checkbox {
        margin-right: 4px;
      }
    }

    .status {
      width: 18px;
    }

    .diff {
      display: flex;

      & > div {
        width: 50%;
        margin: 2px;
      }
    }

    ::ng-deep .modal--wide {
      width: 80vw;
    }
  `]
})
export class ImplementationguideGithubComponent implements OnInit {
  protected igVersion?: ImplementationGuideVersion;
  protected loading = false;
  protected pushModalVisible = false;
  protected status: {
    changed: {f: string, s: string}[],
    unchanged: string[];
  };
  protected commit: {message?: string} = {message: 'update from termx'};
  protected diff: GithubDiff;
  protected selection: {[key: string]: boolean} = {};
  protected igInitialized: boolean;
  protected branchExists: boolean;

  protected baseBranch: string;
  protected branches: string[];

  protected loader = new LoadingManager();

  public constructor(
    private igService: ImplementationGuideService,
    private githubService: ImplementationGuideGithubService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const version = this.route.snapshot.paramMap.get('versionCode');
    this.loading = true;

    this.githubService.authenticate(id, version, `${window.location.origin + environment.baseHref}/${window.location.pathname}`).subscribe(r => {
      if (!r.isAuthenticated) {
        window.location.href = r.redirectUrl;
        return;
      }
      forkJoin([
        this.igService.loadVersion(id, version).pipe(tap(r => {
          this.igVersion = r;
          this.igVersion.github.branch ??= 'main';
        })),
        this.loadGitStatus(id, version)
      ]).subscribe().add(() => this.loading = false);
    });
  }

  private loadGitStatus(id: string, version: string): Observable<any> {
    return this.githubService.status(id, version).pipe(mergeMap(r => {
      this.igInitialized = r.igInitialized;
      this.branchExists = r.branchExists;
      if (r.files) {
        this.status = {
          changed: Object.keys(r.files).filter(f => ['A', 'D', 'M'].includes(r.files[f])).map(f => ({f: f, s: r.files[f]})),
          unchanged: Object.keys(r.files).filter(f => 'U' === r.files[f])
        };
        this.status.changed.forEach(c => this.selection[c.f] = false);
        this.selectAll(true);
      }
      if (!this.branchExists && !this.branches) {
        this.baseBranch = 'main';
        return this.githubService.listBranches(id, version).pipe(
          tap(rr => this.branches = rr),
          map(() => r)
        );
      }
      return of(r);
    }));
  }

  public showDiff(file: string): void {
    this.diff = {};
    this.githubService.diff(this.igVersion.implementationGuide, this.igVersion.version, file).subscribe(r => this.diff = r);
  }

  public push(): void {
    const files = this.allSelected(this.selection) ? null : this.status.changed.filter(c => this.selected(c)).map(c => c.f);
    const req$ = this.githubService.push(this.igVersion.implementationGuide, this.igVersion.version, this.commit.message, files).pipe(
      delay(1000), // seems like github need a bit of time to actually update
      mergeMap(() => this.loadGitStatus(this.igVersion.implementationGuide, this.igVersion.version))
    );
    this.loader.wrap('push', req$).subscribe();
  }

  public initializeIg(): void {
    const req$ = this.githubService.initIg(this.igVersion.implementationGuide, this.igVersion.version).pipe(
      delay(1000),
      mergeMap(() => this.loadGitStatus(this.igVersion.implementationGuide, this.igVersion.version))
    );
    this.loader.wrap('ig', req$).subscribe();
  }

  public createBranch(): void {
    const req$ = this.githubService.createBranch(this.igVersion.implementationGuide, this.igVersion.version, this.baseBranch).pipe(
      delay(1000),
      mergeMap(() => this.loadGitStatus(this.igVersion.implementationGuide, this.igVersion.version))
    );
    this.loader.wrap('ig', req$).subscribe();
  }

  public selectAll(selected: boolean): void {
    this.status.changed.forEach(c => this.selection[c.f] = selected);
    this.selection = {...this.selection};
  }

  public allSelected(selection: {[k: string]: boolean}): boolean {
    return Object.values(selection).every(x => x);
  }

  public noneSelected(selection: {[k: string]: boolean}): boolean {
    return !Object.values(selection).some(x => x);
  }

  public selected = (changed: {f: string, s: string}): boolean => {
    return this.selection[changed.f];
  };

  public onSelectionChange(): void {
    this.selection = {...this.selection};
  }
}
