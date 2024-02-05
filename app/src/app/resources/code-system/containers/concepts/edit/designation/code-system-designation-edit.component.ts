import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {BooleanInput, collect, isDefined} from '@kodality-web/core-util';
import {Designation, EntityProperty} from 'app/src/app/resources/_lib';
import {environment} from 'environments/environment';

@Component({
  selector: 'tw-code-system-designation-edit',
  templateUrl: 'code-system-designation-edit.component.html',
  styles: [`
    .italic {
      font-style: italic;
      white-space: nowrap;
    }

    .col {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      align-self: stretch;
    }

    .row {
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
  @Input() public designations?: Designation[];
  @Input() public properties?: EntityProperty[];
  @Input() public supportedLangs?: string[];

  public ngOnChanges(changes: SimpleChanges): void {
    if ((changes['properties'] || changes['supportedLangs'])
      && this.properties && this.designations && this.supportedLangs
      && !this.viewMode) {
      this.addDefDesignations();
    }
  }

  public getDesignations(): Designation[] {
    return this.designations.filter(d => isDefined(d.name) && d.name !== '');
  }

  protected collectDesignations = (designations: Designation[]): {[dType: string]: Designation[]} => {
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
        });
    });
  }

  protected deleteDesignation(designation: Designation): void {
    if (designation.supplement) {
      return;
    }
    this.designations = [...this.designations.filter(d => d !== designation)];
  }
}
