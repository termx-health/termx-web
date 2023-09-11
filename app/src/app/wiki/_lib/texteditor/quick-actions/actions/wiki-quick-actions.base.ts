import {Directive} from '@angular/core';
import {WikiDropdownOptionItem} from '../../../texteditor/quick-actions/components/wiki-quick-actions-dropdown-option.component';
import {Subject} from 'rxjs';

export class WikiQuickActionDefinition extends WikiDropdownOptionItem {
  public result?: string;
  public cursorOffset?: (res: string) => number;
}

@Directive()
export abstract class WikiQuickActionsBaseComponent {
  public abstract definition: Omit<WikiQuickActionDefinition, 'result'>;
  public resolve = new Subject<any>();

  public abstract handle(ctx?: {lang?: string});
}
