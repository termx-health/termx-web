import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {CodeSystem} from 'terminology-lib/resources';
import {CodeSystemService} from './services/code-system.service';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';


@Component({
  selector: 'twa-code-system-duplicate-modal',
  templateUrl: './code-system-duplicate-modal.component.html',
})
export class CodeSystemDuplicateModalComponent {
  @Input() public codeSystems?: CodeSystem[];
  @Output() public codeSystemDuplicate: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public selectedCodeSystem?: string;
  public targetCodeSystem?: string;
  public targetUri?: string;

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(codeSystem?: string): void {
    this.modalVisible = !this.modalVisible;
    this.selectedCodeSystem = codeSystem || '';
  }

  public duplicate(): void {
    if (!this.validate()) {
      return;
    }
    const duplicateRequest = {sourceCodeSystem: this.selectedCodeSystem!, targetCodeSystemUri: this.targetUri!};
    this.codeSystemService.duplicateCodeSystem(this.targetCodeSystem!, duplicateRequest).subscribe(() => {
        this.modalVisible = false;
        this.codeSystemDuplicate.emit();
      }
    );
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
