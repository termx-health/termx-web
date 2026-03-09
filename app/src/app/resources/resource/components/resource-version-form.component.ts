import {Component, ViewChild} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';
import { MuiCardModule, MuiFormModule, MuiDatePickerModule, MuiMultiLanguageInputModule } from '@kodality-web/marina-ui';
import { StatusTagComponent } from 'term-web/core/ui/components/publication-status-tag/status-tag.component';

import { ValueSetConceptSelectComponent } from 'term-web/resources/_lib/value-set/containers/value-set-concept-select.component';
import { SemanticVersionSelectComponent } from 'term-web/core/ui/components/inputs/version-select/semantic-version-select.component';
import { ResourceIdentifiersComponent } from 'term-web/resources/resource/components/resource-identifiers.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-resource-version-form',
    templateUrl: 'resource-version-form.component.html',
    imports: [MuiCardModule, StatusTagComponent, FormsModule, MuiFormModule, ValueSetConceptSelectComponent, SemanticVersionSelectComponent, MuiDatePickerModule, MuiMultiLanguageInputModule, ResourceIdentifiersComponent, TranslatePipe]
})
export class ResourceVersionFormComponent {
  public version: ResourceVersion = {status: 'draft', version: '1.0.0', algorithm: 'semver', releaseDate: new Date(), identifiers: []};

  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor() {}

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public getVersion(): ResourceVersion {
    return this.version;
  }
}
