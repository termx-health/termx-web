import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystem} from 'terminology-lib/codesystem';
import {CodeSystemService} from '../services/code-system.service';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'twa-code-system-form',
  templateUrl: 'code-system-form.component.html'
})
export class CodeSystemFormComponent implements OnChanges {
  public codeSystem?: CodeSystem;
  public loading?: boolean;

  @Input() public codeSystemId?: string;
  @Input() public mode?: 'edit' | 'add';
  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
  ) { }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes["codeSystemId"]?.currentValue || changes["mode"].currentValue) {
      this.initCodeSystem();
    }
  }

  private initCodeSystem(): void {
    if (this.mode === 'add') {
      this.codeSystem = new CodeSystem();
      this.codeSystem.names = {};
    }
    if (this.mode === 'edit' && this.codeSystemId) {
      this.loading = true;
      this.codeSystemService.load(this.codeSystemId)
        .subscribe(cs => this.codeSystem = cs)
        .add(() => this.loading = false);
    }
  }

  public readForm(): CodeSystem | undefined {
    return this.codeSystem;
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
