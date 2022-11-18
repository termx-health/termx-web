import {AfterViewInit, Component, forwardRef, Input, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {ActiveDescendantKeyManager} from '@angular/cdk/a11y';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {ThesaurusDropdownOptionComponent, OptionItem} from './thesaurus-dropdown-option.component';
import {ThesaurusDropdownComponent} from './thesaurus-dropdown.component';
import {BooleanInput, isDefined} from '@kodality-web/core-util';
import {ThesaurusLinkModalComponent} from './link/thesaurus-link-modal.component';
import {ThesaurusStructureDefinitionModalComponent} from './structuredefinition/thesaurus-structure-definition-modal.component';
import {ThesaurusTemplateModalComponent} from './template/thesaurus-template-modal.component';

@Component({
  selector: 'twa-smart-text-editor',
  templateUrl: './thesaurus-smart-text-editor.component.html',
  styles: [`
    .input-wrapper {
      position: relative;
      min-width: 5.625rem;
      padding: .5rem 0 1.5rem;
    }

    .dropdown-options-container {
      max-height: 15rem;
      border-radius: 3px;
      box-shadow: 0 1px 4px 0 rgba(0, 0, 0, .24);
      overflow-y: scroll;
      scroll-behavior: smooth;
    }`],
  providers: [{provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ThesaurusSmartTextEditorComponent), multi: true}]
})
export class ThesaurusSmartTextEditorComponent implements AfterViewInit, ControlValueAccessor {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public valueType?: 'html' | 'markdown';
  @Input() public lang?: string;
  @Input() public showPreview:boolean = false;
  public value?: string;
  public range?: Range;
  public popupItems: OptionItem[] = [
    {id: 'link', name: 'Link', icon: 'link', description: 'Insert a link'},
    {id: 'structure-definition', name: 'Structure definition', icon: 'profile', description: 'Insert structure definition'},
    {id: 'template', name: 'Template', icon: 'file-text', description: 'Insert template'},
    {id: 'bullet-list', name: 'Bullet list', icon: 'unordered-list', description: 'Create an unordered list', result: '* '},
    {id: 'numbered-list', name: 'Numbered list', icon: 'ordered-list', description: 'Create an ordered list', result: '1. '},
    {id: 'divider', name: 'Divider', icon: 'line', description: 'Separate content with horizontal line', result: '*** '},
    {id: 'code', name: 'Code', icon: 'code', description: 'Syntax highlight', result: '```\n\n``` '},
    {id: 'heading-1', name: 'Heading 1', icon: 'font-size', description: 'Top level heading', result: '# '},
    {id: 'heading-2', name: 'Heading 2', icon: 'font-size', description: 'Sections', result: '## '}
  ];

  @ViewChild("linkModal") public linkModal?: ThesaurusLinkModalComponent;
  @ViewChild("structureDefinitionModal") public structureDefinitionModal?: ThesaurusStructureDefinitionModalComponent;
  @ViewChild("templateModal") public templateModal?: ThesaurusTemplateModalComponent;
  @ViewChild(ThesaurusDropdownComponent) public dropdown?: ThesaurusDropdownComponent;
  @ViewChildren(ThesaurusDropdownOptionComponent) public options?: QueryList<ThesaurusDropdownOptionComponent>;

  public onChange = (x: any): void => x;
  public onTouched = (x?: any): void => x;

  private keyManager?: ActiveDescendantKeyManager<ThesaurusDropdownOptionComponent>;

  public constructor() {}

  public ngAfterViewInit(): void {
    setTimeout(() => {
      this.keyManager = new ActiveDescendantKeyManager(this.options!)
        .withHorizontalOrientation('ltr')
        .withVerticalOrientation(true)
        .withWrap();
    });
  }

  public showDropdown(): void {
    this.dropdown?.show();
    if (this.options?.length) {
      this.keyManager!.setFirstItemActive();
    }
  }

  public hideDropdown(): void {
    this.dropdown?.hide();
  }

  public onKeyUp(event: KeyboardEvent): void {
    if (event.key === '/' && !this.dropdown?.showing) {
      const selection = window.getSelection();
      this.range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : undefined;
      this.showDropdown();
      return;
    }
  }

  public onKeyDown(event: KeyboardEvent): void {
    if (event.key === '/' || !this.dropdown?.showing) {
      return;
    }
    event.preventDefault();
    if (event.key === 'Enter' && this.keyManager!.activeItem) {
      this.selectOption(this.keyManager!.activeItem.item!);
    } else if (['ArrowUp', 'Up', 'ArrowDown', 'Down', 'ArrowRight', 'Right', 'ArrowLeft', 'Left'].includes(event.key)) {
      this.keyManager!.onKeydown(event);
      if (this.keyManager!.activeItem?.item?.id) {
        const targetElement = document.getElementById(this.keyManager!.activeItem?.item?.id);
        document.getElementById("options-container")?.scrollTo(0, targetElement!.offsetTop);
      }
    } else {
      this.hideDropdown();
    }
  }

  public selectOption(item: OptionItem): void {
    this.hideDropdown();
    if (isDefined(item.result)) {
      this.insertOption(item.result);
    } else {
      this.handleAction(item.id!);
    }
  }

  public insertOption(result: string): void {
    if (!result) {
      result = "";
    }
    const selection = window.getSelection();
    if (selection && this.range) {
      const currentText = document.getElementById("textarea")?.innerText;
      this.range.deleteContents();
      this.range.insertNode(document.createTextNode(result));
      selection.removeAllRanges();
      selection.addRange(this.range);

      let newText = document.getElementById("textarea")?.innerText;
      const i = this.indexOfDifference(currentText, newText);
      if (isDefined(i) && newText && newText.charAt(i - 1) === '/') {
        newText = newText.slice(0, i - 1) + newText.slice(i);
      }
      this.value = newText;
      this.fireOnChange(newText || "");
    }
  }

  private handleAction(itemId: string): void {
    if (itemId === 'link') {
      this.linkModal?.toggleModal(true);
    }
    if (itemId === 'structure-definition') {
      this.structureDefinitionModal?.toggleModal(true);
    }
    if (itemId === 'template') {
      this.templateModal?.toggleModal(true);
    }
  }

  public indexOfDifference(str1?: string, str2?: string): number | undefined {
    if (str1 == str2 || !isDefined(str1) || !isDefined(str2)) {
      return;
    }
    for (var i = 0; i < str1.length && i < str2.length; ++i) {
      if (str1.charAt(i) != str2.charAt(i)) {
        break;
      }
    }
    if (i < str2.length || i < str1.length) {
      return i;
    }
  }

  public writeValue(val: string): void {
    this.value = val;
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public fireOnChange(val: string): void {
    this.onChange(val);
  }
}
