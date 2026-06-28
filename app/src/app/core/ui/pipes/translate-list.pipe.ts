import {Pipe, PipeTransform, inject} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

/**
 * Splits a separator-delimited string, translates each token, and re-joins.
 * e.g. "role.admin, role.user" | translateList -> "Administrator, User".
 */
@Pipe({ name: 'translateList' })
export class TranslateListPipe implements PipeTransform {
  private translate = inject(TranslateService);

  public transform(value: string, separator: string = ', '): string {
    if (!value) {
      return value;
    }
    return value.split(separator).map(item => this.translate.instant(item.trim())).join(separator);
  }
}
