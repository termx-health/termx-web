import {Component, Input, OnChanges, SimpleChanges, ViewChild} from '@angular/core';
import {Designation, EntityProperty} from 'terminology-lib/resources';
import {isDefined, SearchResult, validateForm} from '@kodality-web/core-util';
import {CodeSystemService} from '../../services/code-system.service';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'twa-code-system-designation-form',
  templateUrl: './code-system-designation-form.component.html',
})
export class CodeSystemDesignationFormComponent implements OnChanges {
  @Input() public codeSystemId?: string;
  @Input() public designation?: Designation;

  @ViewChild("form") public form?: NgForm;

  public entityProperties: SearchResult<EntityProperty> = SearchResult.empty();
  public loading = false;

  public constructor(
    private codeSystemService: CodeSystemService,
  ) { }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['codeSystemId'] && this.codeSystemId) {
      this.loadProperties(this.codeSystemId);
    }
  }

  private loadProperties(codeSystem: string): void {
    this.loading = true;
    this.codeSystemService.searchProperties(codeSystem, {limit: -1})
      .subscribe(result => this.entityProperties = result)
      .add(() => this.loading = false);
  }

  public validate(): boolean {
    return isDefined(this.form) && validateForm(this.form);
  }
}
