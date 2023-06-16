import {Component, Input, OnInit} from '@angular/core';
import {GithubExportable, GithubService} from './github.service';
import {concat, toArray} from 'rxjs';

@Component({templateUrl: './github-export.component.html', selector: 'tw-github-export'})
export class GithubExportComponent implements OnInit {

  @Input()
  public prepareExport!: () => GithubExportable[];
  @Input()
  public title!: string;
  @Input()
  public type: 'button' | 'text' = 'button';

  public modalVisible!: boolean;
  public authenticated!: boolean;
  public loading!: boolean;
  public commitMessage!: string;
  public repos: any[] = [];
  public resultUrls!: string[];

  private installationId!: number;

  public constructor(
    private githubService: GithubService
  ) {
  }

  public ngOnInit(): void {
    this.commitMessage = `New version of '${this.title}'`;
    this.githubService.listInstallations().subscribe(iss => {
      if (iss && iss.installations?.length >= 1) {
        this.authenticated = true;
        this.installationId = iss.installations[0].id as number;
      }
    });
  }

  public authenticate(): void {
    this.githubService.authenticateApp(`${window.location.origin}/${window.location.pathname}`);
  }

  public openModal(): void {
    if (!this.authenticated) {
      return;
    }

    this.githubService.listRepos(this.installationId).subscribe((repos: any) => {
      this.modalVisible = true;
      this.repos = repos.repositories;
    });
  }

  public export(repoUrl: string): void {
    this.loading = true;
    const exportable = this.prepareExport();
    let observables = exportable.map(e => {
      const data = {repoUrl: repoUrl, message: this.commitMessage, content: btoa(<string>e.content), path: e.filename};
      return this.githubService.export(data);
    });
    concat(...observables).pipe(toArray())
      .subscribe((resp: any[]) => {
        this.resultUrls = resp.filter(r => r?.content?.html_url).map(r => r.content.html_url);
      }).add(() => {
      this.loading = false;
    });
  }
}
