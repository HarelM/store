/**
 * Imports third-party libraries
 */

import { Observable } from 'rxjs';

/**
 * export selector type
 */

export type Comparator = (x: any, y: any) => boolean;
export type PathSelector = (string | number)[];
export type PropertySelector = string | number | symbol;
export type FunctionSelector<RootState, S> = ((s: RootState) => S);
export type Transformer<RootState, V> = (store$: Observable<RootState>, scope: any) => Observable<V>;
export type Selector<RootState, S> = PropertySelector | PathSelector | FunctionSelector<RootState, S>;
