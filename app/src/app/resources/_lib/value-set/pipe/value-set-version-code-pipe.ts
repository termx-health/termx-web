import { Pipe, PipeTransform, inject } from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ValueSetVersionLibService} from 'term-web/resources/_lib/value-set';

@Pipe({ name: 'valueSetVersionCode' })
export class ValueSetVersionCodePipe implements PipeTransform {
  private valueSetVersionService = inject(ValueSetVersionLibService);


  public transform(id: number): Observable<string> {
    if (!id) {
      return EMPTY;
    }

    return this.valueSetVersionService.load(id).pipe(map(resp => resp.version ? resp.version : String(id)));
  }
}
