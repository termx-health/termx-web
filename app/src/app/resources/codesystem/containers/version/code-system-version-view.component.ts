import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemVersion} from 'terminology-lib/resources';
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
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    const codeSystemVersionId = this.route.snapshot.paramMap.get('versionId');
    this.loadVersion(this.codeSystemId!, codeSystemVersionId!);
  }

  private loadVersion(id: string, versionId: string): void {
    this.loading = true;
    this.codeSystemService.loadVersion(id, versionId).subscribe(v => this.version = v).add(() => this.loading = false);
  }

  public save(): void {
    if (!validateForm(this.form)) {
      return;
    }
    this.loading = true;
    this.codeSystemService.saveVersion(this.codeSystemId!, this.version!)
      .subscribe(() => this.location.back())
      .add(() => this.loading = false);
  }
}
