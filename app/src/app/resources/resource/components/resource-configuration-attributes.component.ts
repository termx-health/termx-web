import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemConcept, CodeSystemLibService, ConceptUtil} from 'term-web/resources/_lib';

@Component({
  selector: 'tw-resource-configuration-attributes',
  templateUrl: './resource-configuration-attributes.component.html',
  styles: [`
    @import "../../../../styles/variables";

    .text-editor-wrapper {
      border-radius: @mui-border-radius-component;
      border: @mui-border;
      margin-block: 0.5rem;
      width: 100%;
    }
  `]
})
export class ResourceConfigurationAttributesComponent implements OnInit {
  @Input() public attributes?: any[];
  @ViewChild("form") public form?: NgForm;

  protected rowInstance: any = {};
  protected configurationAttributes: CodeSystemConcept[];
  public constructor(private codeSystemService: CodeSystemLibService) {}

  public ngOnInit(): void {
    this.codeSystemService.searchConcepts('termx-resource-configuration', {limit: -1}).subscribe(resp => this.configurationAttributes = resp.data);
  }

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  protected languageRequired = (attr: string, attributes: CodeSystemConcept[]): boolean => {
    return !!ConceptUtil.getLastVersion(attributes?.find(a => a.code === attr))?.propertyValues?.find(pv => pv.entityProperty === 'language' && pv.value === true);
  };

  protected markdownInput = (attr: string, attributes: CodeSystemConcept[]): boolean => {
    return !!ConceptUtil.getLastVersion(attributes?.find(a => a.code === attr))?.propertyValues?.find(pv => pv.entityProperty === 'markdown' && pv.value === true);
  };
}
