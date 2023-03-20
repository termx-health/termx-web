import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {CodeSystemService} from '../../services/code-system.service';
import {CodeSystem} from '@terminology/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';


@Component({
  templateUrl: 'code-system-edit.component.html'
})
export class CodeSystemEditComponent implements OnInit {
  public codeSystemId?: string | null;
  public codeSystem?: CodeSystem;

  public narrativeRaw = false;
  public loading: {[k: string]: boolean} = {};
  public mode: 'edit' | 'add' = 'add';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id');
    this.mode = this.codeSystemId ? 'edit' : 'add';

    if (this.mode === 'add') {
      this.codeSystem = new CodeSystem();
      this.codeSystem.names = {};
    }

    if (this.mode === 'edit') {
      this.loading ['init'] = true;
      this.codeSystemService.load(this.codeSystemId!, true).subscribe(cs => this.codeSystem = cs).add(() => this.loading ['init'] = false);
    }
  }

  public save(): void {
    if (!this.validate()) {
      return;
    }
    this.loading['save'] = true;
    this.codeSystemService.save(this.codeSystem!)
      .subscribe(() => this.location.back())
      .add(() => this.loading['save'] = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
