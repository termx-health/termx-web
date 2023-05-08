import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LoadingManager} from '@kodality-web/core-util';
import {SequenceLibService} from '../services/sequence-lib.service';

@Component({
  selector: 'tw-sequence-value-generator',
  template: `
    <m-button (mClick)="generateValue()">
      <m-icon [mCode]="loader.isLoading ? 'loading' : 'reload'"></m-icon>
    </m-button>
  `,
})
export class SequenceValueGeneratorComponent {
  @Input() public code: string;
  @Output() public valueGenerated = new EventEmitter<string>();

  protected loader = new LoadingManager();

  public constructor(
    private sequenceService: SequenceLibService
  ) { }

  protected generateValue(): void {
    if (this.code) {
      this.loader.wrap('generate', this.sequenceService.nextValue(this.code)).subscribe(resp => {
        this.valueGenerated.emit(resp);
      });
    }
  }
}
