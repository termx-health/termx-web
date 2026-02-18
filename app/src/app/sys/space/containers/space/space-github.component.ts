import { Component, OnInit, inject } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import { LoadingManager, ApplyPipe, FilterPipe } from '@kodality-web/core-util';
import {environment} from 'environments/environment';
import {delay, forkJoin, mergeMap, Observable, tap} from 'rxjs';
import {GithubDiff} from 'term-web/integration/_lib/github/github';
import {SpaceGithubService} from 'term-web/sys/space/services/space-github.service';
import {Space} from 'term-web/sys/_lib/space';
import {SpaceService} from 'term-web/sys/space/services/space.service';
import { MuiFormModule, MuiCardModule, MuiIconModule, MuiCheckboxModule, MuiCoreModule, MuiAlertModule, MuiButtonModule, MuiPopconfirmModule, MuiModalModule, MuiInputModule, MuiSkeletonModule } from '@kodality-web/marina-ui';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiffViewComponent } from 'term-web/core/ui/components/diff/diff-view.component';
import { TranslatePipe } from '@ngx-translate/core';

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
  `],
    imports: [MuiFormModule, MuiCardModule, MuiIconModule, MuiCheckboxModule, MuiCoreModule, MuiAlertModule, MuiButtonModule, MuiPopconfirmModule, NgTemplateOutlet, MuiModalModule, MuiInputModule, FormsModule, MuiSkeletonModule, DiffViewComponent, TranslatePipe, ApplyPipe, FilterPipe]
})
export class SpaceGithubComponent implements OnInit {
  private spaceService = inject(SpaceService);
  private spaceGithubService = inject(SpaceGithubService);
  private route = inject(ActivatedRoute);

  protected space?: Space;
  protected loading = false;
  protected pushModalVisible = false;
  protected status: {
    changed: {f: string, s: string}[],
    unchanged: string[];
  };
  protected commit: {message?: string} = {message: 'update space from termx'};
  protected diff: GithubDiff;
  protected selection: {[key: string]: boolean} = {};

  protected loader = new LoadingManager();

  public ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;

    this.spaceGithubService.authenticate(id, `${window.location.origin + environment.baseHref}${window.location.pathname}`).subscribe(r => {
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
    return this.spaceGithubService.status(id).pipe(tap(r => {
      this.status = {
        changed: Object.keys(r.files).filter(f => ['A', 'D', 'M'].includes(r.files[f])).map(f => ({f: f, s: r.files[f]})),
        unchanged: Object.keys(r.files).filter(f => 'U' === r.files[f])
      };
      this.status.changed.forEach(c => this.selection[c.f] = false);
      const files = this.route.snapshot.paramMap.get('files');
      this.selectAll(true, files);
    }));
  }

  public showDiff(file: string): void {
    this.diff = {};
    this.spaceGithubService.diff(this.space.id, file).subscribe(r => this.diff = r);
  }

  public pull(): void {
    const files = this.allSelected(this.selection) ? null : this.status.changed.filter(c => this.selected(c)).map(c => c.f);
    const req$ = this.spaceGithubService.pull(this.space.id, files).pipe(mergeMap(() => this.loadGitStatus(this.space.id)));
    this.loader.wrap('pull', req$).subscribe();
  }

  public push(): void {
    const files = this.allSelected(this.selection) ? null : this.status.changed.filter(c => this.selected(c)).map(c => c.f);
    const req$ = this.spaceGithubService.push(this.space.id, this.commit.message, files).pipe(
      delay(1000), // seems like github need a bit of time to actually update
      mergeMap(() => this.loadGitStatus(this.space.id))
    );
    this.loader.wrap('push', req$).subscribe();
  }

  public selectAll(selected: boolean, files?: string): void {
    const prefixes = !files ? null : files.split(',').map(f => {
      const d = f.split('|');
      return this.space.integration.github.dirs[d[0]] + '/' + d[1];
    });
    this.status.changed
      .filter(c => !prefixes || prefixes.some(p => c.f.startsWith(p)))
      .forEach(c => this.selection[c.f] = selected);
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
