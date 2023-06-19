import {Component, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {isDefined, LoadingManager, validateForm} from '@kodality-web/core-util';
import {ResourceVersion} from 'term-web/resources/resource/model/resource-version';


@Component({
  selector: 'tw-resource-version-form',
  templateUrl: 'resource-version-form.component.html'
})
export class ResourceVersionFormComponent {
  public version: ResourceVersion = {status: 'draft', version: '1.0.0', algorithm: 'semver', from: new Date()};

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
