import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CodeSystemVersion} from 'terminology-lib/resources';
import {CodeSystemService} from '../../services/code-system.service';

@Component({
  templateUrl: 'code-system-version-view.component.html',
})
export class CodeSystemVersionViewComponent implements OnInit {
  public version?: CodeSystemVersion;
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    const codeSystemId = this.route.snapshot.paramMap.get('id');
    const codeSystemVersion = this.route.snapshot.paramMap.get('version');
    this.loadVersion(codeSystemId!, codeSystemVersion!);
  }

  private loadVersion(id: string, version: string): void {
    this.loading = true;
    this.codeSystemService.loadVersion(id, version).subscribe(v => this.version = v).add(() => this.loading = false);
  }
}
