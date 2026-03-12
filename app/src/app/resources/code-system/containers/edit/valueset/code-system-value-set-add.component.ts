import { Component, Input, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {BooleanInput, LoadingManager, validateForm} from '@kodality-web/core-util';
import {forkJoin} from 'rxjs';
import {CodeSystemLibService, ValueSet, ValueSetTransactionRequest, CodeSystem} from 'term-web/resources/_lib';

import { MuiCardModule, MuiFormModule, MuiCheckboxModule, MuiInputModule } from '@kodality-web/marina-ui';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'tw-cs-value-set',
    templateUrl: 'code-system-value-set-add.component.html',
    imports: [MuiCardModule, FormsModule, MuiFormModule, MuiCheckboxModule, MuiInputModule, SemanticVersionSelectComponent, ValueSetConceptSelectComponent, TranslatePipe]
})
export class CodeSystemValueSetAddComponent {
  private codeSystemService = inject(CodeSystemLibService);

  @Input() public codeSystem?: CodeSystem;
  @Input() public hasRelatedValueSet: boolean;
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @ViewChild("form") public form?: NgForm;

  protected loader = new LoadingManager();
  protected generateValueSet: boolean;
  protected valueSet: ValueSet = {versions: [{status: 'draft'}]};

  public publisherChanged(publisher: string): void {
    if (!publisher) {
      return;
    }
    forkJoin([
      this.codeSystemService.searchProperties('publisher', {names: 'uri'}),
      this.codeSystemService.loadConcept('publisher', publisher)
    ]).subscribe(([prop, c]) => {
      const activeVersion = c.versions?.find(v => v.status === 'active');
      if (activeVersion) {
        const uri = activeVersion.propertyValues?.find(pv => prop.data.map(p => p.id).includes(pv.entityPropertyId))?.value;
        this.valueSet!.uri = uri && this.valueSet!.id ? uri + '/ValueSet/' + this.valueSet!.id : this.valueSet!.uri;
      }
    });
  }

  public valid(): boolean {
    return !this.generateValueSet || validateForm(this.form);
  }

  public getValueSet(): ValueSetTransactionRequest | undefined {
    return this.generateValueSet ? {valueSet: this.valueSet, version: this.valueSet.versions?.[0]} : undefined;
  }

  public generate(generate: boolean): void {
    if (generate) {
      this.valueSet.id = this.codeSystem?.id || this.valueSet.id;
      this.valueSet.publisher = this.codeSystem?.publisher || this.valueSet.publisher;
      this.publisherChanged(this.valueSet.publisher);
    }
  }
}
