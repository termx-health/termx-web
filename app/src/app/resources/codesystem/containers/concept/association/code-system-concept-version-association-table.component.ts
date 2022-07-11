import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BooleanInput, collect} from '@kodality-web/core-util';
import {CodeSystemAssociation, CodeSystemLibService} from 'terminology-lib/resources';

@Component({
  selector: 'twa-code-system-concept-version-association-table',
  templateUrl: './code-system-concept-version-association-table.component.html',
})
export class CodeSystemConceptVersionAssociationTableComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: string | boolean = false;
  @Input() public associations?: CodeSystemAssociation[] = [];
  @Output() public associationsChange = new EventEmitter<CodeSystemAssociation[]>();

  public associationMap?: {[type: string]: CodeSystemAssociation[]} = {};
  public loading = false;

  public constructor(
    public codeSystemService: CodeSystemLibService,
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['associations']) {
      this.associationMap = collect(this.associations || [], a => a.associationType!);
    }
  }

  public deleteAssociation(key: string, index: number): void {
    this.associationMap![key].splice(index, 1);
    this.associationMap = {...this.associationMap};
    this.fireOnChange();
  }

  public get isLoading(): boolean {
    return Object.values(this.loading).some(Boolean);
  }

  private fireOnChange(): void {
    this.associations = Object.values(this.associationMap || []).flat();
    this.associationsChange.emit(this.associations);
  }

}
