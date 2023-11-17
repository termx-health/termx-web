import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BooleanInput, isDefined, validateForm} from '@kodality-web/core-util';
import {NgForm} from '@angular/forms';
import {ImplementationGuideVersionGroup} from 'term-web/implementation-guide/_lib';

@Component({
  selector: 'tw-implementation-guide-group-list',
  templateUrl: './implementation-guide-group-list.component.html',
})
export class ImplementationGuideGroupListComponent implements OnChanges {
  @Input() public ig: string;
  @Input() public groups: ImplementationGuideVersionGroup[];
  @Input() @BooleanInput() public editable: string | boolean;
  @Output() public groupsChanged: EventEmitter<void> = new EventEmitter<void>();


  @ViewChild("form") public form?: NgForm;

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['groups'] && !isDefined(this.groups)) {
      this.groups = [];
    }
  }

  protected addRow(): void {
    this.groups = [...this.groups, {}];
    this.groupsChanged.emit();
  }

  public validate(): boolean {
    return validateForm(this.form);
  }
}
