/**
 * Imports third-party libraries
 */

import { AnyAction, Reducer } from 'redux';

/**
 * Import components
 */

import { get, set } from './object.component';

/**
 * Import interfaces
 */

import { PathSelector } from '../interfaces/selectors.interface';

/**
 * map
 */

let reducerMap: { [id: string]: Reducer<any, AnyAction> } = {};

/**
 * ComposeReducers
 */

function composeReducers(...reducers: Array<Reducer<any, AnyAction>>): Reducer<any, AnyAction> {
    return (state: any, action: AnyAction) => {
        return reducers.reduce((subState, reducer) => reducer(subState, action), state);
    }
}

/**
 * @param rootReducer Call this on your root reducer to enable SubStore
 * functionality for pre-configured stores (e.g. using NgRedux.provideStore()).
 * NgRedux.configureStore
 * does it for you under the hood.
 */

export function enableFractalReducers(rootReducer: Reducer<any, AnyAction>) {
    reducerMap = {};

    return composeReducers(rootFractalReducer, rootReducer);
}

/**
 * registerFractalReducer
 *
 * @param basePath
 * @param localReducer
 *
 * @hidden
 */

export function registerFractalReducer(
    basePath: PathSelector,
    localReducer: Reducer<any, AnyAction>
): void {
    const existingFractalReducer = reducerMap[JSON.stringify(basePath)];
    if (existingFractalReducer && existingFractalReducer !== localReducer) {
        throw new Error(
            `attempt to overwrite fractal reducer for basePath ${ basePath }`
        );
    }

    reducerMap[JSON.stringify(basePath)] = localReducer;
}

/**
 * replaceLocalReducer
 *
 * @param basePath
 * @param nextLocalReducer
 *
 * @hidden
 */

export function replaceLocalReducer(
    basePath: PathSelector,
    nextLocalReducer: Reducer<any, AnyAction>
): void {
    reducerMap[JSON.stringify(basePath)] = nextLocalReducer;
}

/**
 * rootFractalReducer
 *
 * @param state
 * @param action
 */

function rootFractalReducer(
    state: {} = {},
    action: AnyAction & { '@angular-redux2::fractalkey'?: string }
) {
    const fractalKey = action['@angular-redux2::fractalkey'];
    const fractalPath = fractalKey ? JSON.parse(fractalKey) : [];
    const localReducer = reducerMap[fractalKey || ''];
    return fractalKey && localReducer
        ? set(state, fractalPath, localReducer(get(state, fractalPath), action))
        : state;
}
