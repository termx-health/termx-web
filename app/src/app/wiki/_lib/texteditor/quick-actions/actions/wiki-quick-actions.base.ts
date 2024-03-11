import {Directive} from '@angular/core';
import {Subject} from 'rxjs';
import {WikiDropdownOptionItem} from '../../../texteditor/quick-actions/components/wiki-quick-actions-dropdown-option.component';

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
