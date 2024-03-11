import {Location} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {validateForm} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {Package, Space, TerminologyServer, TerminologyServerLibService} from 'term-web/space/_lib';
import {SpaceGithubService} from 'term-web/space/services/space-github.service';
import {PackageService} from '../../services/package.service';
import {SpaceService} from '../../services/space.service';

@Component({
  templateUrl: './space-edit.component.html',
  styles: [`
    ::ng-deep .github-dirs {
      padding-left: 40px;
      & .ant-input-group-addon {
        text-align: right;
        min-width: 160px;
      }
    }
  `]
})
export class SpaceEditComponent implements OnInit {
  public space?: Space;
  public packages?: Package[];
  public terminologyServers?: TerminologyServer[];
  public githubProviders: {[k: string]: string};
  public githubEnabled: boolean;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private spaceService: SpaceService,
    private spaceGithubService: SpaceGithubService,
    private packageService: PackageService,
    private terminologyServerService: TerminologyServerLibService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) { }

  public ngOnInit(): void {
    this.loadTerminologyServers();
    const id = this.route.snapshot.paramMap.get('id');
    this.mode = id ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadSpace(Number(id));
    } else {
      this.space = this.writeSpace(new Space());
    }
  }

  private loadSpace(id: number): void {
    this.loading = true;
    forkJoin([
      this.spaceService.load(id),
      this.spaceService.loadPackages(id),
      this.spaceGithubService.getProviders()
    ]).subscribe(([space, packages, githubProviders]) => {
      this.githubProviders = githubProviders;
      this.space = this.writeSpace(space);
      this.packages = packages;
    }).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.space.integration.github = this.githubEnabled ? this.space.integration.github : null;
    this.spaceService.save(this.space)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }

  private writeSpace(s: Space): Space {
    this.githubEnabled = !!s.integration?.github;
    s.acl ??= {};
    s.integration ??= {};
    s.integration.github ??= {dirs: this.githubProviders};
    s.integration.github.dirs ??= {};
    return s;
  }

  public addPackage(): void {
    this.router.navigate(['/spaces/', this.space.id, 'packages', 'add']);
  }

  public openPackage(id: number): void {
    this.router.navigate(['/spaces/', this.space.id, 'packages', id, 'edit']);
  }

  public deletePackage(id: number): void {
    this.loading = true;
    this.packageService.delete(this.space.id, id).subscribe(() => this.loadSpace(this.space.id)).add(() => this.loading = false);
  }

  private loadTerminologyServers(): void {
    this.terminologyServerService.search({limit: -1}).subscribe(r => this.terminologyServers = r.data);
  }

  protected sort(arr: any[]): any[] {
    return arr.sort();
  }
}
