import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BooleanInput} from '@kodality-web/core-util';
import {map, Observable, of} from 'rxjs';
import {SnomedLibService} from '../services/snomed-lib.service';


@Component({
  selector: 'tw-snomed-drawer-search',
  templateUrl: 'snomed-drawer-search.component.html'
})
export class SnomedDrawerSearchComponent {
  @Input() public value: string;
  @Input() @BooleanInput() public allowClear: string | boolean = true;
  @Input() @BooleanInput() public disabled: string | boolean;
  @Output() public twChange = new EventEmitter<string>();

  protected drawerOpened: boolean;

  public constructor(private snomedService: SnomedLibService) {}

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
    return this.snomedService.loadConcept(val).pipe(map(concept => {
      return concept.conceptId + ' | ' + concept.pt.term;
    }));
  };

}
