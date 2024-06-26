import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BooleanInput, collect, isDefined, remove} from '@kodality-web/core-util';
import {Designation, EntityProperty} from 'app/src/app/resources/_lib';
import {environment} from 'environments/environment';
import {v4 as uuid} from "uuid";

type ExtendedDesignation = Designation & {_key?: string};

@Component({
  selector: 'tw-code-system-designation-edit',
  templateUrl: 'code-system-designation-edit.component.html',
  styles: [`
    .italic {
      font-style: italic;
      white-space: nowrap;
    }

    .designation-col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-self: stretch;
    }

    .designation-row {
      flex: 1;
      display: flex;
      align-items: center;
    }

    .m-subtitle {
      margin-block: 0.75rem 0.25rem;

      &:first-child {
        margin-top: 0;
      }
    }
  `]
})
export class CodeSystemDesignationEditComponent implements OnChanges {
  @Input() @BooleanInput() public viewMode: boolean | string = false;
  @Input() public designations?: ExtendedDesignation[];
  @Input() public properties?: EntityProperty[];
  @Input() public supportedLangs?: string[];

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['designations']) {
      this.designations?.forEach(d => d._key = uuid());
    }
    if ((changes['properties'] || changes['supportedLangs'])
      && this.properties && this.designations && this.supportedLangs
      && !this.viewMode) {
      this.addDefDesignations();
    }
  }

  public getDesignations(): Designation[] {
    return this.designations.filter(d => isDefined(d.name) && d.name !== '');
  }

  protected collectDesignations = (designations: ExtendedDesignation[]): {[dType: string]: ExtendedDesignation[]} => {
    return collect(designations, d => d.designationType);
  };

  private addDefDesignations(): void {
    const properties = this.properties.filter(p => p.kind === 'designation');
    const langs = this.supportedLangs?.length > 0 ? this.supportedLangs : [environment.defaultLanguage];
    properties.forEach(p => {
      langs
        .filter(l => !this.designations.find(d => d.designationType === p.name && d.language === l))
        .forEach(l => {
          this.designations.push({designationTypeId: p.id, designationType: p.name, language: l, status: 'draft', caseSignificance: 'ci'});
          this.designations = [...this.designations];
          this.designations.forEach(d => d._key = uuid());
        });
    });
  }

  protected deleteDesignation(designation: Designation): void {
    if (designation.supplement) {
      return;
    }
    this.designations = remove(this.designations, designation);
  }
}
