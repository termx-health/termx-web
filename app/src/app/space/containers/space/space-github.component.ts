import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpaceService} from '../../services/space.service';
import {Space} from '../../_lib';
import {delay, forkJoin, mergeMap, Observable, tap} from 'rxjs';
import {PageService} from 'term-web/wiki/page/services/page.service';
import {GithubDiff} from 'term-web/integration/_lib/github/github';

@Component({
  templateUrl: './space-github.component.html',
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
export class SpaceGithubComponent implements OnInit {
  protected space?: Space;
  protected loading = false;
  protected saving = false;
  protected pushModalVisible = false;
  protected status: {
    changed: {f: string, s: string}[],
    unchanged: string[];
  };
  protected commit: {message?: string} = {message: 'update space from termx'};
  protected diff: GithubDiff;
  protected selection: {[key: string]: boolean} = {};

  public constructor(
    private spaceService: SpaceService,
    private pageService: PageService,
    private route: ActivatedRoute
  ) { }

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.spaceService.githubAuthenticate(id, `${window.location.origin}/${window.location.pathname}`).subscribe(r => {
      if (!r.isAuthenticated) {
        window.location.href = r.redirectUrl;
        return;
      }
      forkJoin([
        this.spaceService.load(id).pipe(tap(r => this.space = r)),
        this.loadGitStatus(id)
      ]).subscribe().add(() => this.loading = false);
    });
  }

  private loadGitStatus(id: number): Observable<any> {
    return this.spaceService.githubStatus(id).pipe(tap(r => {
      this.status = {
        changed: Object.keys(r.files).filter(f => ['A', 'D', 'M'].includes(r.files[f])).map(f => ({f: f, s: r.files[f]})),
        unchanged: Object.keys(r.files).filter(f => 'U' === r.files[f])
      };
      this.status.changed.forEach(c => this.selection[c.f] = false);
      let prefix = this.route.snapshot.paramMap.get('prefix');
      this.selectAll(true, prefix);
    }));
  }

  public showDiff(file: string): void {
    this.diff = {};
    this.spaceService.githubDiff(this.space.id, file).subscribe(r => this.diff = r);
  }

  public pull(): void {
    this.saving = true;
    const files = this.allSelected(this.selection) ? null : this.status.changed.filter(c => this.selected(c)).map(c => c.f);
    this.spaceService.githubPull(this.space.id, files).pipe(
      mergeMap(() => this.loadGitStatus(this.space.id))
    ).subscribe().add(() => this.saving = false);
  }

  public push(): void {
    this.saving = true;
    const files = this.allSelected(this.selection) ? null : this.status.changed.filter(c => this.selected(c)).map(c => c.f);
    this.spaceService.githubPush(this.space.id, this.commit.message, files).pipe(
      delay(1000), // seems like github need a bit of time to actually update
      mergeMap(() => this.loadGitStatus(this.space.id))
    ).subscribe().add(() => this.saving = false);
  }

  public selectAll(selected: boolean, prefix?: string): void {
    this.status.changed.filter(c => !prefix || c.f.startsWith(prefix)).forEach(c => this.selection[c.f] = selected);
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
