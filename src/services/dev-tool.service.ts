/**
 * Imports third-party libraries
 */

import { NgZone } from '@angular/core';
import { Injectable, ApplicationRef } from '@angular/core';

/**
 * NgRedux
 */

import { NgRedux } from '../ng-redux';

/**
 * Declare window const
 * A window containing a DOM document; the document property points to the DOM document loaded in that window.
 */

const environment: { [key: string]: any } = typeof window !== 'undefined' ? window : {};

/**
 * Redux DevTools chrome extension.
 */

@Injectable()
export class DevToolsExtension {

    /**
     * Constructor
     * dependency injection of appRef, ngRedux
     */

    constructor(private appRef: ApplicationRef, private ngRedux: NgRedux<any>) {}

    /**
     * Returns true if the extension is installed and enabled.
     */

    isEnabled(): boolean {
        return environment && environment.__REDUX_DEVTOOLS_EXTENSION__;
    }

    /**
     * A wrapper for the Chrome Extension Redux DevTools.
     * Makes sure state changes triggered by the extension
     * trigger Angular change detector.
     *
     * @argument options: dev tool options; same
     * format as described here:
     * [zalmoxisus/redux-devtools-extension/blob/master/docs/API/Arguments.md]
     */

    enhancer(options?: Object): any {
        let subscription: Function;

        if (!this.isEnabled()) {
            return null;
        }

        // Make sure changes from dev tools update angular views.
        environment.__REDUX_DEVTOOLS_EXTENSION__.listen(({ type }: any) => {
            if (type === 'START') {
                subscription = this.ngRedux.subscribe(() => {
                    if (!NgZone.isInAngularZone()) {
                        this.appRef.tick();
                    }
                });
            } else if (type === 'STOP') {
                subscription();
            }
        });

        return environment.__REDUX_DEVTOOLS_EXTENSION__(options);
    }
}
