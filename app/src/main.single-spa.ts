import {enableProdMode, NgZone} from '@angular/core';

import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {NavigationStart, Router} from '@angular/router';

import {getSingleSpaExtraProviders, singleSpaAngular} from 'single-spa-angular';


import {AppModule} from './app/app.module';
import {environment} from './environments/environment';
import {singleSpaPropsSubject} from './single-spa/single-spa-props';

if (environment.production) {
  enableProdMode();
}

export const lifecycles = singleSpaAngular({
  bootstrapFunction: singleSpaProps => {
    singleSpaPropsSubject.next(singleSpaProps);
    return platformBrowserDynamic(getSingleSpaExtraProviders()).bootstrapModule(AppModule);
  },
  template: '<twa-root />',
  Router,
  NavigationStart,
  NgZone,
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
