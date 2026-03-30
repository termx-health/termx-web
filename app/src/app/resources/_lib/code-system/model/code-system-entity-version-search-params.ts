import {QueryParams} from '@termx-health/core-util';

export class CodeSystemEntityVersionSearchParams extends QueryParams {
  public code?: string;
  public codesNe?: string;
  public codeContains?: string;
  public descriptionContains?: string;
  public textContains?: string;
  public status?: string;
  public codeSystem?: string;
  public codeSystemEntityId?: number;
  public codeSystemVersionId?: number;
  public codeSystemVersion?: string;
  public codeSystemUri?: string;
  public unlinked?: boolean;
}
