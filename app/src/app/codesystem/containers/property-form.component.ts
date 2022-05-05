import {Component, OnInit, ViewChild} from '@angular/core';
import {NgForm} from '@angular/forms';
import {CodeSystemService} from '../services/code-system.service';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {isDefined, validateForm} from '@kodality-web/core-util';
import {EntityProperty} from 'terminology-lib/codesystem/services/entity-property';

@Component({
  selector: 'twa-property-form',
  templateUrl: './property-form.component.html',
})
export class PropertyFormComponent implements OnInit {

  public loading?: boolean;
  public property?: EntityProperty;
  public name?: string;
  public codeSystemId?: string;
  public mode?: 'add' | 'edit';

  @ViewChild("form") public form?: NgForm;

  public constructor(
    private codeSystemService: CodeSystemService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  public ngOnInit(): void {
    this.codeSystemId = this.route.snapshot.paramMap.get('id') || undefined;
    this.name = this.route.snapshot.paramMap.get('versionId') || undefined;
    this.loading = true;
    if (this.codeSystemId && this.name) {
      this.mode = 'edit';
      this.codeSystemService.loadProperty(this.codeSystemId, this.name)
        .subscribe(v => this.property = v)
        .add(() => this.loading = false);
    } else {
      this.mode = 'add';
      this.property = new EntityProperty();
      this.loading = false;
    }
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }

  public save(): void {
    if (this.validate() && this.codeSystemId && this.property) {
      this.loading = true;
      if (this.mode === 'add') {
        this.codeSystemService
          .saveProperty(this.codeSystemId, this.property)
          .subscribe(() => this.location.back())
          .add(() => this.loading = false);
      }
      if (this.mode === 'edit' && this.property.id) {
        this.codeSystemService
          .editProperty(this.codeSystemId, this.property.id, this.property)
          .subscribe(() => this.location.back())
          .add(() => this.loading = false);
      }
    }
  }
}
