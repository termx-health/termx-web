import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'validateUrl'
})
export class ValidateUrlPipe implements PipeTransform {

  public transform(value: string): boolean {
    try {
      const urlObj = new URL(value);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch (e) {
      return false;
    }
  }
}
