import {InjectionToken} from '@angular/core';

export type TerminologyLibContext = {
  production: boolean,
  yupiEnabled: boolean,
};
export const TERMINOLOGY_LIB_CONTEXT = new InjectionToken<TerminologyLibContext>('TERMINOLOGY_LIB_CONTEXT');
export const TERMINOLOGY_API_URL = new InjectionToken<string>('TERMINOLOGY_API_URL');


export const OIDC_CONFIG = new InjectionToken<TerminologyLibContext>('TERMINOLOGY_OIDC_CONFIG');
export const TERMINOLOGY_CHEF_URL = new InjectionToken<string>('TERMINOLOGY_CHEF_API');
