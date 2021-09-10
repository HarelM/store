/**
 * Imports third-party libraries
 */

import { NgZone } from '@angular/core';
import { Action, AnyAction } from 'redux';
import { take, toArray } from 'rxjs/operators';

/**
 * Import interfaces
 */

import { StoreInterface } from '../../interfaces/observable.interface';

/**
 * Import store
 */

import { RootStore } from '../../store/root.store';

/**
 * NgRedux
 */

import { NgRedux } from "../../";

/**
 * Zone
 */

class MockNgZone extends NgZone {
    run<T>(fn: (...args: any[]) => T): T {
        return fn() as T;
    }
}

/**
 * Sub store
 */

interface ISubState {
    wat: {
        quux: number;
    };
}

/**
 * Main store
 */

interface IAppState {
    foo: {
        bar: ISubState;
    };
}

describe('Sub store', () => {
    const defaultReducer = (state: any, _: Action) => state;

    const basePath = [ 'foo', 'bar' ];
    let ngRedux: NgRedux<IAppState>;
    let subStore: StoreInterface<ISubState>;

    beforeEach(() => {
        ngRedux = new RootStore<IAppState>(new MockNgZone({
            enableLongStackTrace: false,
        }) as NgZone);
        ngRedux.configureStore(defaultReducer, {
            foo: {
                bar: { wat: { quux: 3 } },
            },
        });

        subStore = ngRedux.configureSubStore<ISubState>(basePath, defaultReducer);
    });

    it('adds a key to actions it dispatches', () =>
        expect(subStore.dispatch<AnyAction>({ type: 'MY_ACTION' })).toEqual({
            type: 'MY_ACTION',
            '@angular-redux2::fractalkey': '["foo","bar"]',
        }));

    it('gets state rooted at the base path', () =>
        expect(subStore.getState()).toEqual({ wat: { quux: 3 } }));

    it('selects based on base path', () =>
        subStore.select('wat').subscribe(wat => expect(wat).toEqual({ quux: 3 })));

    it(`handles property selection on a base path that doesn't exist yet`, () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select<any>('value')
            .pipe(take(2), toArray())
            .subscribe(v => expect(v).toEqual([ undefined, 'now I exist' ]));
        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
        });
    });

    it(`handles path selection on a base path that doesn't exist yet`, () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select<any>([ 'value' ])
            .pipe(take(2), toArray())
            .subscribe(v => expect(v).toEqual([ undefined, 'now I exist' ]));
        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
        });
    });

    it(`handles function selection on a base path that doesn't exist yet`, () => {
        const nonExistentSubStore = ngRedux.configureSubStore(
            [ 'sure', 'whatever' ],
            (state: any, action: any) => ({ ...state, value: action.newValue })
        );
        nonExistentSubStore
            .select(s => (s ? s.value : s))
            .pipe(take(2), toArray())
            .subscribe(v => expect(v).toEqual([ undefined, 'now I exist' ]));
        nonExistentSubStore.dispatch<AnyAction>({
            type: 'nvm',
            newValue: 'now I exist',
        });
    });

    it('can create its own sub-store', () => {
        const subSubStore = subStore.configureSubStore([ 'wat' ], defaultReducer);
        expect(subSubStore.getState()).toEqual({ quux: 3 });
        subSubStore.select('quux').subscribe(quux => expect(quux).toEqual(3));

        expect(subSubStore.dispatch<AnyAction>({ type: 'MY_ACTION' })).toEqual({
            type: 'MY_ACTION',
            '@angular-redux2::fractalkey': '["foo","bar","wat"]',
        });
    });
});
