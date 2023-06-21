import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {CodeSystemLibService, ValueSet, ValueSetLibService, ValueSetTransactionRequest} from 'term-web/resources/_lib';
import {forkJoin} from 'rxjs';
import {NgForm} from '@angular/forms';
import {LoadingManager, validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'tw-cs-value-set',
  templateUrl: 'code-system-value-set-add.component.html'
})
export class CodeSystemValueSetAddComponent implements OnChanges {
  @Input() public codeSystemId?: string | null;
  @ViewChild("form") public form?: NgForm;

  protected loader = new LoadingManager();
  protected hasRelatedValueSet: boolean = false;
  protected generateValueSet: boolean = false;
  protected valueSet: ValueSet = {versions: [{status: 'draft', version: '1'}]};


  public constructor(private codeSystemService: CodeSystemLibService, private valueSetService: ValueSetLibService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loader.wrap('load', this.valueSetService.search({codeSystem: this.codeSystemId, limit: 0}))
        .subscribe(result => this.hasRelatedValueSet = result.meta?.total > 0);
    }
  }

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
      this.valueSet.id = this.codeSystemId ? this.codeSystemId + '-vs' : this.valueSet.id;
    }
  }
}
