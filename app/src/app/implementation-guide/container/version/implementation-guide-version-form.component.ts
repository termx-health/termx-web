import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ImplementationGuideVersion} from 'term-web/implementation-guide/_lib';


@Component({
  selector: 'tw-implementation-guide-version-form',
  templateUrl: 'implementation-guide-version-form.component.html'
})
export class ImplementationGuideVersionFormComponent {
  public version: ImplementationGuideVersion = {status: 'draft', version: '1.0.0', algorithm: 'semver', template: 'local-template'};

  protected loader = new LoadingManager();

  @ViewChild("form") public form?: NgForm;

  public constructor() {}

  public valid(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public getVersion(): ImplementationGuideVersion {
    return this.version;
  }
}
