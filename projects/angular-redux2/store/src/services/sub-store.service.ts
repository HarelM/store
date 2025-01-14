/**
 * Import third-party libraries
 */

import { AnyAction, Reducer, Store } from 'redux';
import { distinctUntilChanged, map, Observable, ReplaySubject, Subscription } from 'rxjs';

/**
 * Components
 */

import { get } from '../components/object.component';
import { resolver } from '../components/selectors.component';

/**
 * Services
 */

import { NgRedux } from './ng-redux.service';
import { ReducerService } from './reducer.service';

/**
 * Interfaces
 */

import { ACTION_KEY } from '../interfaces/fractal.interface';
import { Comparator, PathSelector, Selector } from '../interfaces/store.interface';

/**
 * Carves off a 'subStore' or 'fractal' store from this one.
 *
 * The returned object is itself an observable store, however any
 * selections, dispatches, or invocations of localReducer will be
 * specific to that sub-store and will not know about the parent
 * ObservableStore from which it was created.
 *
 * This is handy for encapsulating component or module state while
 * still benefiting from time-travel, etc.
 *
 * @example
 * ```typescript
 *   onInit() {
 *     // The reducer passed here will affect state under `users.${userID}`
 *     // in the top-level store.
 *     this.subStore = this.ngRedux.configureSubStore(
 *       ['users', userId],
 *       userComponentReducer,
 *     );
 *
 *     // Substore selections are scoped to the base path used to configure
 *     // the substore.
 *     this.name$ = this.subStore.select('name');
 *     this.occupation$ = this.subStore.select('occupation');
 *     this.loc$ = this.subStore.select(s => s.loc || 0);
 *   }
 * ```
 */

export class SubStoreService<State> implements Store<State> {

    /**
     * Hold subscription to root store with sub-store path.
     */

    private subscription: Subscription;

    /**
     * Hash signature of reducer function.
     */

    private readonly hashReducer: number;

    /**
     * ReducerService
     */

    private readonly reducerService: ReducerService;

    /**
     * Angular subject store.
     * correspond to store change event and trigger rxjs change event.
     */

    private readonly _store$: ReplaySubject<any> = new ReplaySubject<any>(1);

    /**
     * Constructor
     *
     * @param rootStore - root store instance.
     * @param basePath - sub store  base path.
     * @param localReducer - sub store custom reducer.
     */

    constructor(
        private rootStore: NgRedux<any>,
        private basePath: PathSelector,
        private localReducer: Reducer<State>
    ) {
        this.reducerService = ReducerService.getInstance();

        this.hashReducer = this.reducerService.hashSignature(localReducer.toString());
        this.reducerService.registerReducer(this.hashReducer, localReducer);
    }

    /**
     * Dispatches an actions. It is the only way to trigger a state change.
     * The reducer function, used to create the store, will be called with the current state tree and the given actions.
     * Its return value will be considered the next state of the tree, and the change listeners will be notified.
     *
     * @param action - action to dispatch.
     *
     * @return dispatch action.
     */

    dispatch<A extends AnyAction>(action: A): A {
        return this.rootStore.dispatch(
            Object.assign({}, action, {
                [ACTION_KEY]: {
                    hash: this.hashReducer,
                    path: this.basePath
                },
            })
        );
    }

    /**
     * Get store state.
     *
     * @example
     * ```typescript
     *   incrementIfOdd(): void {
     *     const { counter } = this.ngRedux.getState();
     *     if (counter % 2 !== 0) {
     *       this.increment();
     *     }
     *   }
     * ```
     *
     * @returns The current state tree of your application.
     */

    getState(): State {
        return get(this.rootStore.getState(), this.basePath);
    }

    /**
     * Set or update substore base path from root store.
     * and set a subscribed for change detection
     *
     * @example
     * ```typescript
     *    ngOnChanges() {
     *         if(this.subStore)
     *             this.subStore.setBasePath([ 'users', this.userId ]);
     *     }
     * ```
     *
     * @param path - the path of select from root store.
     */

    setBasePath(path: PathSelector): void {
        if (this.basePath === path && this.subscription) {
            return;
        }

        this.basePath = path;

        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        this.subscription = this.rootStore.select<State>(this.basePath).subscribe((value: any) => {
            this._store$.next(value);
        });
    }

    /**
     * Carves off a 'subStore' or 'fractal' store from this one.
     *
     * The returned object is itself an observable store, however any
     * selections, dispatches, or invocations of localReducer will be
     * specific to that sub-store and will not know about the parent
     * ObservableStore from which it was created.
     *
     * This is handy for encapsulating component or module state while
     * still benefiting from time-travel, etc.
     *
     * @example
     * ```typescript
     *   onInit() {
     *     // The reducer passed here will affect state under `users.${userID}`
     *     // in the top-level store.
     *     this.subStore = this.ngRedux.configureSubStore(
     *       ['users', userId],
     *       userComponentReducer,
     *     );
     *
     *     // Substore selections are scoped to the base path used to configure
     *     // the substore.
     *     this.name$ = this.subStore.select('name');
     *     this.occupation$ = this.subStore.select('occupation');
     *     this.loc$ = this.subStore.select(s => s.loc || 0);
     *   }
     * ```
     *
     * @param basePath - select part of store
     * @param localReducer - reducer of the same store
     *
     * @return StoreInterface<SubState>
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState>): SubStoreService<SubState> {
        const path = [ ...this.basePath, ...basePath ];
        const subStoreService = new SubStoreService<SubState>(this.rootStore, path, localReducer);
        subStoreService.setBasePath(path);

        return subStoreService;
    }

    /**
     * Select a slice of state to expose as an observable.
     *
     * @example
     * ```typescript
     *
     * constructor(private ngRedux: NgRedux<IAppState>) {}
     *
     * ngOnInit() {
     *   let { increment, decrement } = CounterActions;
     *   this.counter$ = this.ngRedux.select('counter');
     * }
     * ```
     *
     * @param selector - key or function to select a part of the state.
     * @param comparator - comparison function called to test if an item is distinct from the previous item in the source.
     *
     * @return An Observable that emits items from the source Observable with distinct values.
     */

    select<SelectedType>(selector?: Selector<State, SelectedType>, comparator?: Comparator): Observable<SelectedType> {
        return this._store$.pipe(
            distinctUntilChanged(),
            map(resolver(selector)),
            distinctUntilChanged(comparator)
        );
    }

    /**
     * Adds a change listener.
     * It will be called any time an actions is dispatched, and some part of the state tree may potentially have changed.
     * You may then call getState() to read the current state tree inside the callback.
     *
     * 1. The subscriptions are snapshotted just before every dispatch() call.
     * If you subscribe or unsubscribe while the listeners are being invoked,
     * this will not have any effect on the dispatch() that is currently in progress.
     * However, the next dispatch() call, whether nested or not,
     * will use a more recent snapshot of the subscription list.
     *
     * 2. The listener should not expect to see all states changes,
     * as the state might have been updated multiple times during a nested dispatch() before the listener is called.
     * It is, however, guaranteed that all subscribers registered before the dispatch()
     * started will be called with the latest state by the time it exits.
     *
     * @example
     * ```typescript
     *   constructor(
     *     private ngRedux: NgRedux<IAppState>,
     *     private actions: CounterActions,
     *   ) {
     *     this.subscription = ngRedux
     *       .select<number>('count')
     *       .subscribe(newCount => (this.count = newCount));
     *   }
     *
     *   ngOnDestroy() {
     *     this.subscription.unsubscribe();
     *   }
     * ```
     *
     * @param listener - A callback to be invoked on every dispatch.
     */

    subscribe(listener: () => void): (() => void) {
        const subscription = this.select().subscribe(listener);

        return () => subscription.unsubscribe();
    }

    /**
     * Replaces the reducer currently used by the store to calculate the state.
     * You might need this if your app implements code splitting, and you want to load some reducers dynamically.
     * You might also need this if you implement a hot reloading mechanism for Redux.
     *
     * @example
     * ```typescript
     * const newRootReducer = combineReducers({
     *   existingSlice: existingSliceReducer,
     *   newSlice: newSliceReducer
     * })
     *
     * ngRedux.replaceReducer(newRootReducer)
     * ```
     *
     * @param nextLocalReducer - Reducer<RootState, AnyAction>
     * @return void
     */

    replaceReducer(nextLocalReducer: Reducer<State>) {
        return this.reducerService.replaceReducer(this.hashReducer, nextLocalReducer);
    }

    /**
     * Interoperability point for observable/reactive libraries.
     * @returns {observable} A minimal observable of state changes.
     * For more information, see the observable proposal:
     * https://github.com/tc39/proposal-observable
     *
     * @hidden
     */

    [Symbol.observable](): any {
        return this._store$;
    }
}
