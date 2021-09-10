/**
 * Imports third-party libraries
 */

import { NgModule, NgZone } from '@angular/core';

/**
 * Import services
 */

import { DevToolsExtension } from "./services/dev-tool.service";

/**
 * NgRedux
 */

import { NgRedux } from "./ng-redux";

/**
 * Import store
 */

import { RootStore } from "./store/root.store";


/** @hidden */
export function _ngReduxFactory(ngZoneObject: NgZone) {
    return new RootStore(ngZoneObject);
}

/**
 * NgReduxModule
 */

@NgModule({
    providers: [
        DevToolsExtension,
        { provide: NgRedux, useFactory: _ngReduxFactory, deps: [ NgZone ] },
    ],
})
export class NgReduxModule {
}
