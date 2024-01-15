import {LocalizedName} from '@kodality-web/marina-util';

export class Release {
  public id?: number;
  public code?: string;
  public names?: LocalizedName;
  public planned?: Date;
  public releaseDate?: Date;
  public status?: string;
}
