/**
 * Import third-party libraries
 */

import { Action } from 'redux';
import { Observable } from 'rxjs';

/**
 * The primitive type are accept by selector array.
 * select from store by Array<string | number>.
 *
 * @example
 * ```typescript
 *  @Select(['foo', 'name']) readonly name$: Observable<string>;
 * ```
 */

export type PathSelector = Array<string | number>;

/**
 * The primitive type are accept by selector.
 * select from store by `string` | `number` | `symbol`.
 *
 * @example
 * ```typescript
 *  @Select('name') readonly name$: Observable<string>;
 * ```
 */

export type PropertySelector = string | number | symbol;

/**
 * select from store by functional conditions.
 *
 * @example
 * ```typescript
 *  @Select(store => store.name || 'new name') readonly name$: Observable<string>;
 * ```
 */

export type FunctionSelector<RootState, S> = ((s: RootState) => S);

/**
 * combine all oder type `PropertySelector` | `PathSelector` | `FunctionSelector<RootState, S>`
 */

export type Selector<RootState, S> = PropertySelector | PathSelector | FunctionSelector<RootState, S>;

/**
 * Type of function used to determine if this selector has changed.
 * Custom equality checker that can be used with `.select` and `@Select`.
 *
 * @example
 * ```typescript
 * const customCompare: Comparator = (x: any, y: any) => {
 *     return x.id === y.id
 * }
 *
 * @Select(selector, customCompare)
 * ```
 */

export type Comparator = (state: any, newState: any) => boolean;

/**
 *  Type of transformer -
 *  function takes the store observable as an input and returns a derived observable from it.
 */

export type Transformer<RootState, FragmentStore> = (store$: Observable<RootState>, scope: any) => Observable<FragmentStore>;

/**
 * Type of reducer action function for use in the auto generation.
 * help to typescript generate auto-complete.
 *
 * @example
 * ```typescript
 *
 *     static actions: {
 *         bugAdded: ActionPayload<Auth>
 *     };
 *
 * ```
 */
// Todo change the name to dispach action ?
// Todo create action extend payload for reducer action
export type ActionPayload<Payload = undefined> = (payload?: Payload) => AnyAction;

export interface AnyAction<Payload = undefined> extends Action {
    payload?: Payload;
    [extraProps: string]: any;
}

/**
 * Type of fractal action
 * @hidden
 */

export type FractalKey = {
    hash: number;
    path: PathSelector;
};
