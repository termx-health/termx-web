import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DefinedProperty} from 'term-web/resources/_lib';

@Pipe({name: 'entityPropertyName'})
export class EntityPropertyNamePipe implements PipeTransform {
  public constructor(private translateService: TranslateService) {}

  public transform(prop: DefinedProperty): string {
    const lang = this.translateService.currentLang;
    if (prop?.description?.[lang] && prop.description[lang] !== '') {
      return prop.description[lang];
    }
    if (Object.values(prop?.description)?.[0] && Object.values(prop.description)[0] !== '') {
      return Object.values(prop.description)[0];
    }
    return prop.name;
  }
}

