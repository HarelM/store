/**
 * Imports
 */

import { Reducer, AnyAction } from 'redux';

/**
 * Used with the `@WithSubStore` class decorator to define a SubStore (AKA a
 * fractal store).
 *
 * For more info on sub-stores, see
 * https://github.com/angular-redux/store/blob/master/articles/fractal-store.md
 */

export interface IFractalStoreOptions {
    /**
     * The name of an instance method that will define the
     * base path for the subStore. This method is expected to return an array
     * of property names or undefined/null.
     */
    basePathMethodName: string;

    /**
     * The localReducer for the sub-store in question.
     */
    localReducer: Reducer<any, AnyAction>;
}
