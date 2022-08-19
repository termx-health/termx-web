import {Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import {Designation, EntityProperty} from 'lib/src/resources';
import {CodeSystemService} from '../../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {BooleanInput, validateForm} from '@kodality-web/core-util';
import {CodeSystemDesignationGroupEditComponent} from './code-system-designation-group-edit.component';

@Component({
  selector: 'twa-code-system-designation-edit',
  templateUrl: './code-system-designation-edit.component.html',
})
export class CodeSystemDesignationEditComponent implements OnChanges, OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public designations?: Designation[];
  @Input() public codeSystemId?: string;
  @Input() public requiredLanguages?: string[];

  @ViewChild("modalForm") public modalForm?: NgForm;
  @ViewChildren(CodeSystemDesignationGroupEditComponent) public designationForms?: QueryList<CodeSystemDesignationGroupEditComponent>;

  public entityProperties: EntityProperty[] = [];
  public loading: {[k: string]: boolean} = {};
  public designationGroups: {
    designationTypeId: number,
    designationKind: string,
    caseSignificance: string,
    designations?: Designation[]
  }[] = [];

  public modalData?: {
    visible: boolean,
    designation: Designation
  };

  public constructor(
    private codeSystemService: CodeSystemService,
  ) {}

  public ngOnInit(): void {
    this.newModal();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties(this.codeSystemId);
    }
    if (changes['designations'] && this.designations) {
      this.convertToDesignationGroup(this.designations);
    }
  }

  public convertToDesignationGroup(designations: Designation[]): void {
    this.designationGroups = [];
    designations.forEach(d => {
      this.addDesignationToMap(d);
    });
  }

  public convertFromDesignationMap(): Designation[] {
    let designations: Designation[] = [];
    this.designationGroups.forEach(g => {
      g.designations?.forEach(d => {
        d.designationTypeId = g.designationTypeId;
        d.caseSignificance = g.caseSignificance;
        d.designationKind = g.designationKind;
        designations.push(d);
      });
    });
    return designations;
  }

  private loadProperties(codeSystem: string): void {
    this.loading['properties'] = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(result => this.entityProperties = result.data)
      .add(() => this.loading['properties'] = false);
  }

  public confirmModal(): void {
    if (validateForm(this.modalForm)) {
      this.addDesignationToMap(this.modalData!.designation);
      this.newModal();
    }
  }

  public newModal(): void {
    this.modalData = {
      visible: false,
      designation: new Designation()
    };
  }

  public getDesignations(): Designation[] {
    return this.designationGroups && this.convertFromDesignationMap() || [];
  }

  public valid(): boolean {
    return !this.designationForms?.find(f => !f.validate());
  }

  private addDesignationToMap(d: Designation): void {
    const matchingRow = this.designationGroups.find(r =>
      r.designationTypeId === d.designationTypeId &&
      r.designationKind === d.designationKind &&
      r.caseSignificance === d.caseSignificance);
    if (matchingRow) {
      matchingRow.designations = [...(matchingRow.designations || []), d];
    } else {
      this.designationGroups.push({
        designationTypeId: d.designationTypeId!,
        designationKind: d.designationKind!,
        caseSignificance: d.caseSignificance!,
        designations: [d]
      });
    }
  }
}
