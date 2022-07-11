import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {CodeSystemAssociation, CodeSystemEntityVersion} from 'terminology-lib/resources';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'twa-code-system-association-form',
  templateUrl: './code-system-association-form.component.html',
})
export class CodeSystemAssociationFormComponent implements OnInit {
  @Input() public codeSystemId?: string;
  @Input() public association?: CodeSystemAssociation;

  @ViewChild("form") public form?: NgForm;

  public target?: CodeSystemEntityVersion;
  public loading = false;

  public ngOnInit(): void {
    if (this.codeSystemId && this.association) {
      this.association.codeSystem = this.codeSystemId;
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
