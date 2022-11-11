import {Component, Input, OnInit} from '@angular/core';
import {GithubExportable, GithubService} from './github.service';

@Component({templateUrl: './github-export.component.html', selector: 'twa-github-export'})
export class GithubExportComponent implements OnInit {

  @Input()
  public prepareExport!: () => GithubExportable;
  @Input()
  public title!: string;

  public modalVisible!: boolean;
  public authenticated!: boolean;
  public loading!: boolean;
  public commitMessage!: string;
  public repos: any[] = [];
  public resultUrl!: string;

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
    this.githubService.listRepos(this.installationId).subscribe((repos: any) => {
      this.modalVisible = true;
      this.repos = repos.repositories;
    });
  }

  public export(repoUrl: string): void {
    this.loading = true;
    const exportable = this.prepareExport();
    const data = {repoUrl: repoUrl, message: this.commitMessage, content: btoa(<string>exportable.content), path: exportable.filename};
    this.githubService.export(data).subscribe(resp => {
      this.resultUrl = resp?.content?.html_url;
    }).add(() => {
      this.loading = false;
    });
  }
}