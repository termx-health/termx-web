import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { isDefined, validateForm, ApplyPipe } from '@kodality-web/core-util';
import { MuiEditableTableComponent, MuiCardModule, MuiDropdownModule, MuiCoreModule, MuiEditableTableModule, MuiTooltipModule, MuiTextareaModule } from '@kodality-web/marina-ui';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import {CodeSystemConcept, CodeSystemLibService, ConceptUtil} from 'term-web/resources/_lib';
import {ChecklistRule} from 'term-web/sys/_lib';
import { AddButtonComponent } from 'term-web/core/ui/components/add-button/add-button.component';
import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { WikiSmartTextEditorViewComponent } from 'term-web/wiki/_lib/texteditor/wiki-smart-text-editor-view.component';
import { WikiSmartTextEditorComponent } from 'term-web/wiki/_lib/texteditor/wiki-smart-text-editor.component';

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
  `],
    imports: [MuiCardModule, MuiDropdownModule, AddButtonComponent, MuiCoreModule, FormsModule, MuiEditableTableModule, MuiTooltipModule, ValueSetConceptSelectComponent, WikiSmartTextEditorViewComponent, MuiTextareaModule, WikiSmartTextEditorComponent, TranslatePipe, ApplyPipe]
})
export class ResourceConfigurationAttributesComponent implements OnInit {
  private codeSystemService = inject(CodeSystemLibService);
  private translateService = inject(TranslateService);

  @Input() public attributes?: any[];
  @ViewChild("form") public form?: NgForm;
  @ViewChild(MuiEditableTableComponent) public table?: MuiEditableTableComponent<ChecklistRule>;

  protected rowInstance: any = {};
  protected configurationAttributes: CodeSystemConcept[];

  public ngOnInit(): void {
    this.codeSystemService.searchConcepts('termx-resource-configuration', {limit: -1}).subscribe(resp => this.configurationAttributes = resp.data);
  }

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form) && isDefined(this.table) && this.table.validate();
  }

  protected languageRequired = (attr: string, attributes: CodeSystemConcept[]): boolean => {
    return !!ConceptUtil.getLastVersion(attributes?.find(a => a.code === attr))?.propertyValues
      ?.find(pv => pv.entityProperty === 'language' && pv.value === true);
  };

  protected markdownInput = (attr: string, attributes: CodeSystemConcept[]): boolean => {
    return !!ConceptUtil.getLastVersion(attributes?.find(a => a.code === attr))?.propertyValues
      ?.find(pv => pv.entityProperty === 'markdown' && pv.value === true);
  };

  protected addAttribute(attr: CodeSystemConcept): void {
    this.attributes = [...this.attributes, {attribute: attr.code}];
  }

  protected attributeDesignation = (attr: string, attributes: CodeSystemConcept[], designationType: string, defCode?: boolean): string => {
    return ConceptUtil.getLastVersion(attributes?.find(a => a.code === attr))?.designations
      ?.find(d => d.designationType === designationType && d.language === this.translateService.currentLang)?.name || defCode && attr;
  };
}
