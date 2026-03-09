import { Location } from '@angular/common';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { validateForm, ApplyPipe, KeysPipe } from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {Package, Space, TerminologyServer, TerminologyServerLibService} from 'term-web/sys/_lib/space';
import {SpaceGithubService} from 'term-web/sys/space/services/space-github.service';
import {PackageService} from 'term-web/sys/space/services/package.service';
import {SpaceService} from 'term-web/sys/space/services/space.service';
import { MuiFormModule, MuiSpinnerModule, MuiCardModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiCheckboxModule, MuiSelectModule, MuiDividerModule, MuiListModule, MuiCoreModule, MuiPopconfirmModule, MuiIconModule, MuiInputModule, MuiButtonModule } from '@kodality-web/marina-ui';
import { TranslatePipe } from '@ngx-translate/core';
import { MarinaUtilModule } from '@kodality-web/marina-util';

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
  `],
    imports: [MuiFormModule, MuiSpinnerModule, MuiCardModule, FormsModule, MuiTextareaModule, MuiMultiLanguageInputModule, MuiCheckboxModule, MuiSelectModule, MuiDividerModule, MuiListModule, MuiCoreModule, MuiPopconfirmModule, MuiIconModule, MuiInputModule, MuiButtonModule, TranslatePipe, MarinaUtilModule, ApplyPipe, KeysPipe]
})
export class SpaceEditComponent implements OnInit {
  private spaceService = inject(SpaceService);
  private spaceGithubService = inject(SpaceGithubService);
  private packageService = inject(PackageService);
  private terminologyServerService = inject(TerminologyServerLibService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  public space?: Space;
  public packages?: Package[];
  public terminologyServers?: TerminologyServer[];
  public githubProviders: {[k: string]: string};
  public githubEnabled: boolean;

  public loading = false;
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

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
    return arr.sort((a, b) => String(a).localeCompare(String(b)));
  }
}
