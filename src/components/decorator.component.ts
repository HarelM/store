/**
 * Imports third-party libraries
 */

import { distinctUntilChanged } from "rxjs/operators";

/**
 * NgRedux
 */

import { NgRedux } from "../ng-redux";

/**
 * Import interface
 */

import { StoreInterface } from "../interfaces/observable.interface";
import { IFractalStoreOptions } from "../interfaces/decorator.interface";
import { Comparator, PathSelector, Selector } from "../interfaces/selectors.interface";

/**
 * OPTIONS_KEY: this is per-class (static) and holds the config from the
 * @SubStore decorator.
 */

const OPTIONS_KEY = '@angular-redux::substore::class::options';

/**
 * INSTANCE_SUBSTORE_KEY, INSTANCE_SELECTIONS_KEY: these are per-instance
 * (non-static) and holds references to the substores/selected observables
 * to be used by an instance of a decorated class. I'm not using
 * reflect-metadata here because I want
 *
 * 1. different instances to have different substores in the case where
 * `basePathMethodName` is dynamic.
 * 2. the instance substore to be garbage collected when the instance is no
 * longer reachable.
 * This is therefore an own-property on the actual instance of the decorated
 * class.
 */

const INSTANCE_SUBSTORE_KEY = '@angular-redux2::substore::instance::store';
const INSTANCE_SELECTIONS_KEY = '@angular-redux2::substore::instance::selections';

/**
 * Used to detect when the base path changes - this allows components to
 * dynamically adjust their selections if necessary.
 */

const INSTANCE_BASE_PATH_KEY = '@angular-redux2::substore::instance::basepath';

/**
 *
 * @param decoratedInstance
 */

function getClassOptions(decoratedInstance: any): IFractalStoreOptions {
    return decoratedInstance.constructor[OPTIONS_KEY];
}

/**
 *
 * @param decoratedClassConstructor
 * @param options
 */

export function setClassOptions(decoratedClassConstructor: any, options: IFractalStoreOptions): void {
    decoratedClassConstructor[OPTIONS_KEY] = options;
}

/**
 * I want the store to be saved on the actual instance so
 * 1. different instances can have distinct sub-stores if necessary
 * 2. the sub-store/selections will be marked for garbage collection when the
 *
 * @param decoratedInstance
 * @param store
 */

function setInstanceStore(decoratedInstance: any, store?: StoreInterface<any>) {
    return decoratedInstance[INSTANCE_SUBSTORE_KEY] = store
}

/**
 *
 * @param decoratedInstance
 */

function getInstanceStore(decoratedInstance: any): StoreInterface<any> {
    return decoratedInstance[INSTANCE_SUBSTORE_KEY];
}

/**
 *
 * @param decoratedInstance
 */

function getInstanceSelectionMap(decoratedInstance: any) {
    const map = decoratedInstance[INSTANCE_SELECTIONS_KEY] || {};
    decoratedInstance[INSTANCE_SELECTIONS_KEY] = map;

    return map;
}

/**
 *
 * @param decoratedInstance
 * @param basePath
 */

function hasBasePathChanged(decoratedInstance: any, basePath?: PathSelector): boolean {
    return decoratedInstance[INSTANCE_BASE_PATH_KEY] !== (basePath || []).toString();
}

/**
 *
 * @param decoratedInstance
 * @param basePath
 */

function setInstanceBasePath(decoratedInstance: any, basePath?: PathSelector): void {
    decoratedInstance[INSTANCE_BASE_PATH_KEY] = (basePath || []).toString();
}

/**
 *
 * @param decoratedInstance
 */

function clearInstanceState(decoratedInstance: any): void {
    decoratedInstance[INSTANCE_SELECTIONS_KEY] = null;
    decoratedInstance[INSTANCE_SUBSTORE_KEY] = null;
    decoratedInstance[INSTANCE_BASE_PATH_KEY] = null;
}

export function getBaseStore(decoratedInstance: any): StoreInterface<any> | undefined {
    // The root store hasn't been set up yet.
    if (!NgRedux.instance) {
        return undefined;
    }


    const options = getClassOptions(decoratedInstance);

    // This is not decorated with `@WithSubStore`. Return the root store.
    if (!options) {
        return NgRedux.instance;
    }

    // Dynamic base path support:
    const basePath = decoratedInstance[options.basePathMethodName]();
    if (hasBasePathChanged(decoratedInstance, basePath)) {
        clearInstanceState(decoratedInstance);
        setInstanceBasePath(decoratedInstance, basePath);
    }

    if (!basePath) {
        return NgRedux.instance;
    }

    const store = getInstanceStore(decoratedInstance);
    if (!store) {
        setInstanceStore(
            decoratedInstance,
            NgRedux.instance.configureSubStore(basePath, options.localReducer)
        );
    }

    return getInstanceStore(decoratedInstance);
}

/**
 * Creates an Observable from the given selection parameters,
 * rooted at decoratedInstance's store, and caches it on the
 * instance for future use.
 * @hidden
 */

export const getInstanceSelection = <T>(
    decoratedInstance: any,
    key: string | symbol,
    selector: Selector<any, T>,
    transformer?: Transformer<any, T>,
    comparator?: Comparator
) => {
    const store = getBaseStore(decoratedInstance);

    if (store) {
        const selections = getInstanceSelectionMap(decoratedInstance);

        selections[key] =
            selections[key] ||
            (!transformer
                ? store.select(selector, comparator)
                : store
                    .select(selector)
                    .pipe(
                        (obs$) => (transformer as any)(obs$, decoratedInstance),
                        distinctUntilChanged(comparator)
                    ));

        return selections[key];
    }

    return undefined;
};
