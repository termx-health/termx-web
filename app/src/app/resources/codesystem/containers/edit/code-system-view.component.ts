import {Component, OnInit, ViewChild} from '@angular/core';
import {CodeSystem} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../../services/code-system.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  templateUrl: './code-system-view.component.html',
})
export class CodeSystemViewComponent implements OnInit {
  public codeSystemId?: string | null;
  public codeSystem?: CodeSystem;

  public narrativeRaw = false;
  public loading = false;

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.loading = true;
    this.codeSystemService.load(this.codeSystemId!, true).subscribe(cs => {
      this.codeSystem = cs;
    }).add(() => this.loading = false);
  }
}
