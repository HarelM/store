# ClassReducer

You can create a class reducer to improve readability and maintenance.

```typescript
/**
 * Imports
 */

import { AbstractReducer, Action, ActionPayload, AnyAction } from "@angular-redux2/store";

/**
 * AuthState interface
 */

export interface Auth {
    isLoggedIn: boolean;
}

/**
 * Init Auth model
 */

export const AUTH_INITIAL_STATE: Auth = {
    isLoggedIn: false
};

/**
 * Class Reducer
 */

export class AuthReducer extends AbstractReducer {

    /**
     * Hold map of all dispatch action that generated by decorator
     * used for autocomplete 
     * 
     * @example
     * ```typescript
     * class Reducer extends AbstractReducer {
     *
     *     // optional static var to allow to add type's for auto-complete
     *     // ActionPayload< payload interface / state >
     *     static override actions: {
     *         addBug: ActionPayload<addBugPayload>,
     *         deleteBug: ActionPayload
     *     };
     * }
     * ```
     */
    
    static actions: {
        isLogin: ActionPayload;
    };
    
    /**
     * Update login data
     */

    @Action
    isLogin(state: Auth, action: AnyAction): void {
        state.isLoggedIn = !state.isLoggedIn;
    }
}

export const authReducer = Reducer.createReducer(AUTH_INITIAL_STATE);
```

Or old way

```typescript
/**
 * Imports
 */

import { AnyAction } from "redux";

/**
 * Update auth user data
 */

export const IS_LOGIN = 'IS_LOGIN';

/**
 * AuthState interface
 */

export interface Auth {
    isLoggedIn: boolean;
}

/**
 * Init Auth model
 */

export const AUTH_INITIAL_STATE: Auth = {
    isLoggedIn: false
};

/**
 * AuthReducer
 */

export function authReducer(state: Auth = AUTH_INITIAL_STATE, action: AnyAction): Auth {
    switch (action.type) {
        case IS_LOGIN:
            return { isLoggedIn: !state.isLoggedIn };
    }

    return state;
}
```