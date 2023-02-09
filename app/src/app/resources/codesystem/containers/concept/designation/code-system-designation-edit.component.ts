import {Component, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren} from '@angular/core';
import {Designation, EntityProperty} from 'lib/src/resources';
import {CodeSystemService} from '../../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {BooleanInput, copyDeep, isDefined, validateForm} from '@kodality-web/core-util';
import {CodeSystemDesignationGroupEditComponent} from './code-system-designation-group-edit.component';
import {finalize, Observable} from 'rxjs';

@Component({
  selector: 'twa-code-system-designation-edit',
  templateUrl: './code-system-designation-edit.component.html',
})
export class CodeSystemDesignationEditComponent implements OnChanges, OnInit {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public designations?: Designation[];
  @Input() public codeSystemId?: string;
  @Input() public supportedLangs?: string[];

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

    if ((changes['codeSystemId'] ||changes['designations']) && this.codeSystemId && this.designations) {
      this.loadProperties(this.codeSystemId).subscribe(result => {
        this.entityProperties = result.data;
        this.convertToDesignationGroup(this.designations!, this.entityProperties!);
      });
    }
  }

  public convertToDesignationGroup(designations: Designation[], properties: EntityProperty[]): void {
    this.designationGroups = [];
    properties.filter(p => ['display', 'definition', 'alias'].includes(p.name!))
      .filter(p => !designations.find(d => d.designationTypeId === p.id))
      .forEach(p => designations.push({language: 'en', designationTypeId: p.id, designationKind: 'text', status: 'draft', caseSignificance: 'ci'}));
    designations.forEach(d => {
      this.addDesignationToMap(d);
    });
    this.designationGroups.forEach(g => {
      this.supportedLangs?.forEach(lang => {
        let designation = g.designations?.find(d => d.language === lang);
        if (!designation) {
          designation = {
            language: lang,
            designationTypeId: g.designationTypeId,
            designationKind: g.designationKind,
            caseSignificance: g.caseSignificance,
            status: 'draft'};
          g.designations?.push(designation);
        }
      });
    });
  }

  public convertFromDesignationMap(): Designation[] {
    let designations: Designation[] = [];
    this.designationGroups.forEach(g => {
      g.designations?.filter(d => isDefined(d.name)).forEach(d => {
        d.designationTypeId = g.designationTypeId;
        d.caseSignificance = g.caseSignificance;
        d.designationKind = g.designationKind;
        designations.push(d);
      });
    });
    return designations;
  }

  private loadProperties(codeSystem: string): Observable<any> {
    this.loading['properties'] = true;
    return this.codeSystemService.searchProperties(codeSystem, {limit: -1}).pipe(finalize(() => this.loading['properties'] = false));
  }

  public confirmModal(): void {
    if (validateForm(this.modalForm)) {
      const designations = (this.supportedLangs || ['en']).map(lang => {
        const designation = copyDeep(this.modalData!.designation);
        designation.language = lang;
        return designation;
      });
      designations.forEach(d => {
        this.addDesignationToMap(d);
      });
      this.newModal();
    }
  }

  public newModal(): void {
    this.modalData = {
      visible: false,
      designation: {designationKind: 'text', status: 'draft', caseSignificance: 'ci'}
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
