import {LocalizedName} from '@termx-health/util';

export class Ecosystem {
  id?: number;
  code?: string;
  names?: LocalizedName;
  formatVersion?: string;
  description?: string;
  active?: boolean;
  serverIds?: number[];
}
