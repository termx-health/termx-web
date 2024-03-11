import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Sequence} from 'term-web/sequence/_lib/models/sequence';
import {SequenceLibService} from '../_lib/services/sequence-lib.service';

@Injectable()
export class SequenceService extends SequenceLibService {
  public save(sequence: Sequence): Observable<Sequence> {
    if (sequence.id) {
      return this.http.put(`${this.baseUrl}/${sequence.id}`, sequence);
    }
    return this.http.post(`${this.baseUrl}`, sequence);
  }
}
