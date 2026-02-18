import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BooleanInput, ApplyPipe } from '@kodality-web/core-util';
import {map, Observable, of} from 'rxjs';
import {SnomedLibService} from 'term-web/integration/_lib';
import { MuiCoreModule, MuiDrawerModule } from '@kodality-web/marina-ui';
import { AsyncPipe } from '@angular/common';
import { SnomedSearchComponent } from 'term-web/integration/_lib/snomed/containers/snomed-search.component';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
    selector: 'tw-snomed-drawer-search',
    templateUrl: 'snomed-drawer-search.component.html',
    imports: [MuiCoreModule, MuiDrawerModule, SnomedSearchComponent, AsyncPipe, ApplyPipe, TranslatePipe]
})
export class SnomedDrawerSearchComponent {
  private snomedService = inject(SnomedLibService);

  @Input() public displayType: 'code' | 'name' | 'codeName' = 'codeName';
  @Input() public value: string;
  @Input() public branch: string;
  @Input() @BooleanInput() public multiple: string | boolean;
  @Input() @BooleanInput() public allowClear: string | boolean = true;
  @Input() @BooleanInput() public disabled: string | boolean;
  @Output() public twChange = new EventEmitter<string>();

  protected drawerOpened: boolean;

  protected onSelect(id: string): void {
    this.twChange.emit(id);
    this.closeDrawer();
  }

  public openDrawer(): void {
    if (this.disabled) {
      return;
    }
    this.drawerOpened = true;
  }

  public closeDrawer(): void {
    this.drawerOpened = false;
  }

  public get valueDefined(): boolean {
    return !!this.value;
  }

  public valueDisplay = (val: string): Observable<string> => {
    if (!val) {
      return of('');
    }
    if (this.displayType === 'code') {
      return of(val);
    }
    return this.snomedService.loadConcept(val).pipe(map(concept => {
      return this.displayType === 'name' ? concept.fsn.term : concept.conceptId + ' | ' + concept.fsn.term;
    }));
  };

}
