import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemVersion} from 'term-web/resources/_lib';
import {CodeSystemService} from '../../services/code-system.service';
import {Location} from '@angular/common';
import {validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  templateUrl: 'code-system-version-view.component.html',
})
export class CodeSystemVersionViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public version?: CodeSystemVersion;
  public loading: {[k: string]: boolean} = {};

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const versionCode = this.route.snapshot.paramMap.get('versionCode');
    this.loadVersion(this.codeSystemId!, versionCode!);
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
}
