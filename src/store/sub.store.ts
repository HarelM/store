/**
 * Imports third-party libraries
 */

import { Observable } from 'rxjs';
import { AnyAction, Dispatch, Reducer } from 'redux';
import { distinctUntilChanged, map } from 'rxjs/operators';

/**
 * Import components
 */

import { get } from '../components/object.component';
import { resolver } from '../components/selectors.component';
import { replaceLocalReducer, registerFractalReducer } from '../components/fractal-reducer.component';

/**
 * Import interfaces
 */

import { StoreInterface } from '../interfaces/observable.interface';
import { Selector, Comparator, PathSelector } from '../interfaces/selectors.interface';

/**
 * NgRedux
 */

import { NgRedux } from "../ng-redux";

/**
 * SubStore
 */

export class SubStore<State> implements StoreInterface<State> {

    /**
     * Constructor
     *
     * @param rootStore
     * @param basePath
     * @param localReducer
     */

    constructor(
        private rootStore: NgRedux<any>,
        private basePath: PathSelector,
        localReducer: Reducer<State, AnyAction>
    ) {
        registerFractalReducer(basePath, localReducer);
    }

    dispatch: Dispatch<AnyAction> = action => {
        return this.rootStore.dispatch(
            Object.assign({}, action, {
                '@angular-redux2::fractalkey': JSON.stringify(this.basePath),
            })
        );
    }

    /**
     * GetState
     */

    getState = (): State => get(this.rootStore.getState(), this.basePath);

    /**
     *
     * @param basePath
     * @param localReducer
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState, AnyAction>): StoreInterface<any> {
        return <any>(new SubStore<SubState>(this.rootStore, [ ...this.basePath, ...basePath ], localReducer));
    }

    /**
     *
     * @param selector
     * @param comparator
     */

    select = <SelectedState>(
        selector?: Selector<State, SelectedState>,
        comparator?: Comparator
    ): Observable<SelectedState> => {
        return this.rootStore
            .select<State>(this.basePath)
            .pipe(
                map(resolver(selector)),
                distinctUntilChanged(comparator)
            );
    }

    /**
     *
     * @param listener
     */

    subscribe(listener: () => void): (() => void) {
        const subscription = this.select().subscribe(listener);
        return () => subscription.unsubscribe();
    }

    /**
     *
     * @param nextLocalReducer
     */

    replaceReducer(nextLocalReducer: Reducer<State, AnyAction>) {
        return replaceLocalReducer(this.basePath, nextLocalReducer);
    }

    [Symbol.observable](): any {
        return this;
    }
}
