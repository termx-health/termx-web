import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SpaceService} from '../../services/space.service';
import {Space} from '../../_lib';
import {delay, forkJoin, mergeMap, Observable, tap} from 'rxjs';
import {PageService} from 'term-web/wiki/page/services/page.service';

@Component({
  templateUrl: './space-github.component.html',
  styles: [`
    .status-row {
      display: flex;
    }
    
    .status {
      width: 18px;
    }
  `]
})
export class SpaceGithubComponent implements OnInit {
  protected space?: Space;
  protected loading = false;
  protected saving = false;
  protected status: {
    changed: {f: string, s: string}[],
    unchanged: string[];
  };
  protected commit: {message?: string} = {message: 'update space from termx'};

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
    return this.spaceService.githubStatus(id).pipe(tap(r => this.status = {
      changed: Object.keys(r.files).filter(f => ['A', 'D', 'M'].includes(r.files[f])).map(f => ({f: f, s: r.files[f]})),
      unchanged: Object.keys(r.files).filter(f => 'U' === r.files[f])
    }));
  }

  public push(): void {
    this.saving = true;
    this.spaceService.githubPush(this.space.id, this.commit.message).pipe(
      delay(1000), // seems like github need a bit of time to actually update
      mergeMap(() => this.loadGitStatus(this.space.id))
    ).subscribe().add(() => this.saving = false);
  }

}
