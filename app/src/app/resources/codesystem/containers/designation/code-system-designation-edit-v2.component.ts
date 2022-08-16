import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {Designation, EntityProperty, MultiLanguageInputLanguage, ValueWithExtras} from 'terminology-lib/resources';
import {ValueSetService} from '../../../valueset/services/value-set.service';
import {CodeSystemService} from '../../services/code-system.service';
import {NgForm} from '@angular/forms';
import {validateForm} from '@kodality-web/core-util';

@Component({
  selector: 'twa-code-system-designation-edit-v2',
  templateUrl: './code-system-designation-edit-v2.component.html',
})
export class CodeSystemDesignationEditV2Component implements OnChanges, OnInit {
  @Input() public designations?: Designation[];
  @Input() public codeSystemId?: string;
  @Input() public requiredLanguages?: string[];
  @ViewChild("form") public form?: NgForm;

  public languages?: MultiLanguageInputLanguage[];
  public entityProperties: EntityProperty[] = [];
  public loading: {[k: string]: boolean} = {};
  public designationMap: {
    [key: string]: {[lang: string]: ValueWithExtras} // //key typeId-designationKind-caseSignificance
  } = {};

  public modalData?: {
    visible: boolean,
    designation: Designation,
    languages: {
      [lang: string]: ValueWithExtras
    }
  };

  public constructor(
    private valueSetService: ValueSetService,
    private codeSystemService: CodeSystemService,
  ) {}

  public ngOnInit(): void {
    this.loadLanguages();
    this.newModal();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties(this.codeSystemId);
    }
    if (changes['designations']) {
      this.makeDesignationMap();
    }
  }

  public makeDesignationMap(): void {
    if (this.designations) {
      this.designations.forEach(d => {
        const mapKey = `${d.designationTypeId}-${d.designationKind}-${d.caseSignificance}`;
        this.designationMap[mapKey] = this.designationMap[mapKey] || {};
        this.designationMap[mapKey][d.language!] = {
          value: d.name!,
          preferred: d.preferred!,
          status: d.status!
        };
      });
    }
  }

  private loadLanguages(): void {
    this.loading['languages'] = true;
    this.valueSetService.expand({valueSet: 'languages'}).subscribe(concepts => concepts.map(c => {
      let names: {
        [language: string]: {
          value: string,
          preferred: boolean,
          status: string
        }
      } = {};
      c.concept?.versions?.filter(version => version.status === 'active')[0].designations?.filter(d => d.language && d.name)
        .forEach(d => {
          names[d.language!] = {value: d.name!, preferred: d.preferred || false, status: d.status!};
        });
      return this.languages = [...this.languages || [], ...[{code: c.concept!.code!, names: names}]];
    })).add(() => this.loading['languages'] = false);
  }

  private loadProperties(codeSystem: string): void {
    this.loading['properties'] = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(result => this.entityProperties = result.data)
      .add(() => this.loading['properties'] = false);
  }

  public confirmModal(): void {
    if (validateForm(this.form) && Object.values(this.modalData!.languages).some(value => value.value)) {
      const mapKey = `${this.modalData!.designation.designationTypeId}-${this.modalData!.designation.designationKind}-${this.modalData!.designation.caseSignificance}`;
      this.designationMap[mapKey] = {...this.designationMap[mapKey], ...this.modalData?.languages!};
      this.designationMap = {...this.designationMap};
      this.newModal();
    }
  }

  public newModal(): void {
    this.modalData = {
      visible: false,
      designation: new Designation(),
      languages: {}
    };
  }
}
