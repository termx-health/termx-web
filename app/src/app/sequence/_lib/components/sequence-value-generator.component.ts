import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {SequenceLibService} from '../services/sequence-lib.service';
import {map, of} from 'rxjs';

@Component({
  selector: 'tw-sequence-value-generator',
  template: `
    <m-button (mClick)="generateValue()">
      <m-icon [mCode]="loader.isLoading ? 'loading' : 'reload'"></m-icon>
    </m-button>
  `,
  host: {
    '[style.display]': `sequenceExists ? 'initial' : 'none'`
  }
})
export class SequenceValueGeneratorComponent implements OnChanges {
  @Input() public code: string;
  @Output() public valueGenerated = new EventEmitter<string>();

  protected sequenceExists: boolean;
  protected loader = new LoadingManager();

  public constructor(
    private sequenceService: SequenceLibService
  ) { }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['code']) {
      const req$ = this.sequenceService.search({
        codes: this.code,
        limit: 1
      }).pipe(map(resp => resp.meta.total > 0));

      (this.code ? req$ : of(false)).subscribe(resp => {
        this.sequenceExists = resp;
      });
    }
  }

  protected generateValue(): void {
    if (this.sequenceExists && this.code) {
      this.loader.wrap('generate', this.sequenceService.nextValue(this.code)).subscribe(resp => {
        this.valueGenerated.emit(resp);
      });
    }
  }
}
