import {Pipe, PipeTransform} from '@angular/core';
import {EMPTY, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {CodeSystemVersionLibService} from '../services/code-system-version-lib.service';

@Pipe({
  name: 'codeSystemVersionCode'
})
export class CodeSystemVersionCodePipe implements PipeTransform {

  public constructor(
    private codeSystemVersionService: CodeSystemVersionLibService
  ) {}

  public transform(id: number): Observable<string> {
    if (!id) {
      return EMPTY;
    }

    return this.codeSystemVersionService.load(id).pipe(map(resp => resp.version ? resp.version : String(id)));
  }
}
