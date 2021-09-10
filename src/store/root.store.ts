/**
 * Imports third-party libraries
 */

import {
    Store,
    AnyAction,
    Reducer,
    Middleware,
    StoreEnhancer,
    Unsubscribe,
    createStore,
    applyMiddleware,
    compose,
    Dispatch,
} from 'redux';
import { NgZone } from '@angular/core';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';

/**
 * Import components
 */

import { resolver } from '../components/selectors.component';
import { enableFractalReducers } from '../components/fractal-reducer.component';

/**
 * Import interfaces
 */

import { StoreInterface } from '../interfaces/observable.interface';
import { Selector, Comparator, PathSelector } from '../interfaces/selectors.interface';

/**
 * Import store
 */

import { SubStore } from './sub.store';

/**
 * NgRedux
 */

import { NgRedux } from "../ng-redux";

/**
 * Root store object
 */

export class RootStore<RootState> extends NgRedux<RootState> {

    private _store: Store<RootState> | undefined = undefined;
    private _store$: BehaviorSubject<RootState>;

    /**
     * Constructor
     * @param ngZone
     */

    constructor(private ngZone: NgZone) {
        super();

        NgRedux.instance = this;
        this._store$ = new BehaviorSubject<RootState | undefined>(undefined).pipe(
            filter(n => n !== undefined),
            switchMap(observableStore => observableStore as any)
            // TODO: fix this? needing to explicitly cast this is wrong
        ) as BehaviorSubject<RootState>;
    }

    /**
     *
     * @param rootReducer
     * @param initState
     * @param middleware
     * @param enhancers
     */

    configureStore(
        rootReducer: Reducer<RootState, AnyAction>,
        initState: RootState,
        middleware: Array<Middleware> = [],
        enhancers: Array<StoreEnhancer<RootState>> = []
    ): void {
        this.assert(!this._store, 'Store already configured!');

        // Composes single-argument functions from right to left.
        const composeResult: any = compose.apply(null, [ applyMiddleware(...middleware), ...enhancers ]);

        this.setStore(
            composeResult(
                createStore
            )(enableFractalReducers(rootReducer), initState)
        );
    }

    /**
     *
     * @param store
     */

    provideStore(store: Store<RootState>): void {
        this.assert(!this._store, 'Store already configured!');
        this.setStore(store);
    }

    /**
     *
     */

    getState = (): RootState => this._store!.getState();

    /**
     *
     * @param listener
     */

    subscribe = (listener: () => void): Unsubscribe => {
        return this._store!.subscribe(listener);
    }

    /**
     *
     * @param nextReducer
     */

    replaceReducer = (nextReducer: Reducer<RootState, AnyAction>): void => {
        this._store!.replaceReducer(nextReducer);
    };

    /**
     *
     * @param action
     */

    dispatch: Dispatch<AnyAction> = <A extends AnyAction>(action: A): A => {
        this.assert(
            !!this._store,
            'Dispatch failed: did you forget to configure your store? ' +
            'https://github.com/angular-redux/@angular-redux/core/blob/master/' +
            'README.md#quick-start'
        );

        if (!NgZone.isInAngularZone()) {
            return this.ngZone.run(() => this._store!.dispatch(action));
        } else {
            return this._store!.dispatch(action);
        }
    };

    /**
     *
     * @param selector
     * @param comparator
     */

    select = <SelectedType>(
        selector?: Selector<RootState, SelectedType>,
        comparator?: Comparator
    ): Observable<SelectedType> =>
        this._store$.pipe(
            distinctUntilChanged(),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );

    /**
     *
     * @param basePath
     * @param localReducer
     */

    configureSubStore = <SubState>(
        basePath: PathSelector,
        localReducer: Reducer<SubState, AnyAction>
    ): StoreInterface<SubState> =>
        new SubStore<SubState>(this, basePath, localReducer);

    /**
     *
     * @param condition
     * @param message
     * @protected
     */

    protected assert(condition: boolean, message: string): void {
        if (!condition) {
            throw new Error(message);
        }
    };

    /**
     *
     * @param store
     * @private
     */

    private setStore(store: Store<RootState>) {
        this._store = store;
        const storeServable = this.storeToObservable(store);
        this._store$.next(storeServable as any);
    }

    /**
     *
     * @param store
     * @private
     */

    private storeToObservable(
        store: Store<RootState>
    ): Observable<RootState> {
        return new Observable<RootState>((observer: Observer<RootState>) => {
            observer.next(store.getState());

            const unsubscribeFromRedux = store.subscribe(() =>
                observer.next(store.getState())
            );

            return () => {
                unsubscribeFromRedux();
                observer.complete();
            };
        });
    }
}
