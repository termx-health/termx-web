import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {NamingSystemIdentifier} from 'term-web/resources/_lib';
import {validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'tw-naming-system-identifier-form',
  templateUrl: './naming-system-identifier-form.component.html',
})
export class NamingSystemIdentifierFormComponent implements OnInit {
  @Input() public identifiers?: NamingSystemIdentifier[];
  @Output() public identifiersChange = new EventEmitter<NamingSystemIdentifier[]>();

  @ViewChild('form') public form!: NgForm;

  public ngOnInit(): void {
    if (!this.identifiers) {
      setTimeout(() => this.addIdentifier());
    }
  }

  public addIdentifier(): void {
    this.identifiers = [...(this.identifiers || []), new NamingSystemIdentifier()];
    this.fireOnChange();
  }

  public removeIdentifier(index: number): void {
    this.identifiers!.splice(index, 1);
    this.identifiers = [...this.identifiers!];
    this.fireOnChange();
  }

  private fireOnChange(): void {
    this.identifiersChange!.emit(this.identifiers);
  }

  public validate(): boolean {
    return validateForm(this.form);
  }
}
