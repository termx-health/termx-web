import {Component, EventEmitter, Output, ViewChild} from '@angular/core';
import {CodeSystemService} from '../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';


@Component({
  selector: 'tw-code-system-supplement-modal',
  templateUrl: './code-system-supplement-modal.component.html',
})
export class CodeSystemSupplementModalComponent {
  @Output() public supplementCreated: EventEmitter<boolean> = new EventEmitter();

  public modalVisible = false;
  public params?: {sourceCodeSystem?: string, targetCodeSystem?: string, targetUri?: string};

  @ViewChild("form") public form?: NgForm;

  public constructor(private codeSystemService: CodeSystemService) { }

  public toggleModal(params?: {sourceCodeSystem: string}): void {
    this.modalVisible = !!params;
    this.params = params;
  }

  public createSupplement(): void {
    if (!validateForm(this.form)) {
      return;
    }
    const request = {
      codeSystem: this.params?.targetCodeSystem!,
      codeSystemUri: this.params?.targetUri!
    };
    this.codeSystemService.supplementCodeSystem(this.params?.sourceCodeSystem!, request).subscribe(() => {
        this.modalVisible = false;
        this.supplementCreated.emit();
      }
    );
  }
}
