import { Pipe, PipeTransform, inject } from '@angular/core';
import {EMPTY, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {SnomedConcept} from 'term-web/integration/_lib/snomed/model/concept/snomed-concept';
import {SnomedLibService} from 'term-web/integration/_lib/snomed/services/snomed-lib.service';
import {SnomedUtil} from 'term-web/integration/_lib/snomed/util/snomed-util';

@Pipe({ name: 'snomedConceptName' })
export class SnomedConceptNamePipe implements PipeTransform {
  private snomedService = inject(SnomedLibService);


  public transform(concept: string | SnomedConcept, type: 'pt' | 'fsn' = 'pt', branch?: string): Observable<string> {
    if (!concept) {
      return EMPTY;
    }
    return (typeof concept === 'string' ? this.snomedService.loadConcept(concept, branch) : of(concept)).pipe(map(c => SnomedUtil.formatConcept(c, type)));
  }
}
