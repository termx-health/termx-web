import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemService} from '../../services/code-system.service';
import {Location} from '@angular/common';
import {map, Observable} from 'rxjs';


@Component({
  templateUrl: 'code-system-version-edit.component.html',
})
export class CodeSystemVersionEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public version?: CodeSystemVersion;

  public loading: {[k: string]: boolean} = {};
  public mode: 'add' | 'edit' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.mode = this.codeSystemId && versionCode ? 'edit' : 'add';

    if (this.mode === 'edit') {
      this.loadVersion(this.codeSystemId!, versionCode!);
    } else {
      this.version = new CodeSystemVersion();
      this.version.status = 'draft';
    }
  }

  private loadVersion(id: string, versionId: string): void {
    this.loading['init'] = true;
    this.codeSystemService.loadVersion(id, versionId).subscribe(v => this.version = v).add(() => this.loading['init'] = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.saveVersion(this.codeSystemId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }


  public get isLoading(): boolean {
    return Object.keys(this.loading).filter(k => 'init' !== k).some(k => this.loading[k]);
  }

  public versions = (id): Observable<string[]> => {
    return this.codeSystemService.searchVersions(id, {limit: -1}).pipe(map(r => r.data.map(d => d.version)));
  };
}
