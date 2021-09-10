/**
 * Imports third-party libraries
 */

import { Observable } from 'rxjs';
import { Store, Reducer, AnyAction } from "redux";

/**
 * Interfaces
 */

import { Selector, PathSelector, Comparator } from './selectors.interface';

/**
 * This interface represents the glue that connects the
 * subscription-oriented Redux Store with the RXJS Observable-oriented
 * Angular component world.
 *
 * Augments the basic Redux store interface with methods to
 * enable selection and factorization.
 */

export interface StoreInterface<StateType> extends Store<StateType> {
    /**
     * Select a slice of state to expose as an observable.
     *
     * @param selector key or function to select a part of the state
     * @param [comparator] Optional
     * comparison function called to test if an item is distinct
     * from the previous item in the source.
     *
     * @returns An Observable that emits items from the
     * source Observable with distinct values.
     */

    select<SelectedType>(selector: Selector<StateType, SelectedType>, comparator?: Comparator): Observable<SelectedType>;

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
     */

    configureSubStore<SubState>(basePath: PathSelector, localReducer: Reducer<SubState, AnyAction>): StoreInterface<SubState>;
}
