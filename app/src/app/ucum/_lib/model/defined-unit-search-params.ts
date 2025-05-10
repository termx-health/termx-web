import {QueryParams} from '@kodality-web/core-util';

export class DefinedUnitSearchParams extends QueryParams {
    public kind?: string;
    public textContains?: string;
}
