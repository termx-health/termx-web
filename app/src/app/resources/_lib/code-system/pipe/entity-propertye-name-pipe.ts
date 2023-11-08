import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DefinedProperty} from 'term-web/resources/_lib';

@Pipe({name: 'entityPropertyName'})
export class EntityPropertyNamePipe implements PipeTransform {
  public constructor(private translateService: TranslateService) {}

  public transform(prop: DefinedProperty): string {
    const lang = this.translateService.currentLang;
    return prop?.description?.[lang] || Object.values(prop?.description)?.[0] || prop.name;
  }
}

