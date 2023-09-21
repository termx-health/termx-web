import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {ValueSetVersionLibService} from '../../value-set';

@Pipe({
  name: 'valueSetVersionCode'
})
export class ValueSetVersionCodePipe implements PipeTransform {

  public constructor(
    private valueSetVersionService: ValueSetVersionLibService
  ) {}

  public transform(id: number): Observable<string> {
    if (!id) {
      return EMPTY;
    }

    return this.valueSetVersionService.load(id).pipe(map(resp => resp.version ? resp.version : String(id)));
  }
}
