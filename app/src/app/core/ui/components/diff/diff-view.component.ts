import {Component, ElementRef, Input, OnChanges, ViewChild} from '@angular/core';
import {OutputFormatType} from 'diff2html/lib/types';
import {createPatch} from 'diff';
import {html} from 'diff2html';
import {BooleanInput, isNil} from '@kodality-web/core-util';


@Component({
  selector: 'tw-diff-view',
  template: `
    <div
        #el
        [class.tw-diff-view--single]="value"
        style="background-color: var(--d2h-bg-color)"
    ></div>
  `,
  styles: [`
    ::ng-deep .tw-diff-view--single {
      .d2h-diff-tbody tr:first-child {
        display: none;
      }

      .d2h-code-line {
        padding: 0 3.5em;
      }

      .d2h-code-linenumber {
        width: 3.75em;

        .line-num1 {
          display: none;
        }
      }
    }
  `]
})
export class DiffViewComponent implements OnChanges {
  @Input() public value: string;
  @Input() public src: string;
  @Input() public tgt: string;
  @Input() public display: OutputFormatType | string = 'line-by-line';
  @Input() @BooleanInput() public full: boolean | string;
  @Input() public numberOffset = 1;

  private _el: HTMLDivElement;

  @ViewChild('el')
  public set el(e: ElementRef<HTMLDivElement>) {
    this._el = e.nativeElement;
    this.generate();
  }

  public ngOnChanges(): void {
    this.generate();
  }


  private generate(): void {
    if (isNil(this._el)) {
      return;
    }
    if (this.value) {
      this._el.innerHTML = this.generateSingle(this.value);
    } else {
      this._el.innerHTML = this.generateDiff(this.src, this.tgt, this.display as OutputFormatType, this.full as boolean);
    }
  }

  private generateDiff(source: string, target: string, viewMode: OutputFormatType, full: boolean): string {
    source ||= '';
    target ||= '';

    const patch = createPatch('history', source, target, '', '', {
      context: full ? Math.max(source.match(/\n/g)?.length ?? 0, target.match(/\n/g)?.length ?? 0) : undefined
    });
    return this.render(patch, viewMode);
  }

  private generateSingle(value: string): string {
    const lines = value.split('\n');

    const patch = '' +
      'Index: \n' +
      '===================================================================\n' +
      '--- \t\n' +
      '+++ \t\n' +
      `@@ -0,0 +${this.numberOffset},${lines.length} @@\n` +
      lines.map(l => ' ' + l).join('\n') +
      '\\ No newline at end of file`';

    return this.render(patch, 'line-by-line');
  }


  private render(patch: string, viewMode: OutputFormatType): string {
    return html(patch, {
      diffStyle: 'char',
      outputFormat: viewMode,
      drawFileList: false,
      rawTemplates: {
        'side-by-side-file-diff': `
          <div id="{{fileHtmlId}}" class="d2h-file-wrapper" data-lang="{{file.language}}">
            <div class="d2h-files-diff">
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            {{{diffs.left}}}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="d2h-file-side-diff">
                    <div class="d2h-code-wrapper">
                        <table class="d2h-diff-table">
                            <tbody class="d2h-diff-tbody">
                            {{{diffs.right}}}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        `,
        'line-by-line-file-diff': `
          <div id="{{fileHtmlId}}" class="d2h-file-wrapper" data-lang="{{file.language}}">
            <div class="d2h-file-diff">
              <div class="d2h-code-wrapper">
                <table class="d2h-diff-table">
                  <tbody class="d2h-diff-tbody">
                    {{{diffs}}}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        `
      }
    });
  }
}
