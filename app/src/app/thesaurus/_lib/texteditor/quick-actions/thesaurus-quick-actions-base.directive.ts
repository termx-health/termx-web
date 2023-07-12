import {Directive} from '@angular/core';
import {ThesaurusDropdownOptionItem} from './dropdown/thesaurus-dropdown-option.component';
import {Subject} from 'rxjs';

export class ThesaurusQuickActionDefinition extends ThesaurusDropdownOptionItem {
  public result?: string;
  public cursorOffset?: (res: string) => number;
}

@Directive()
export abstract class ThesaurusQuickActionsBaseComponent {
  public abstract definition: Omit<ThesaurusQuickActionDefinition, 'result'>;
  public resolve = new Subject<any>();

  public abstract handle(ctx?: {lang?: string});
}
