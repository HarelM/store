/**
 * Gets a deeply-nested property value from an object, given a 'path'
 * of property names or array indices.
 */

export function get(object: any, path: Array<string | number>): any {
    if (!object) {
        return object;
    }

    // If this is an ImmutableJS structure, use existing getIn function
    if ('function' === typeof object.getIn) {
        return object.getIn(path);
    }

    const [ firstElem, ...restElems ] = path;

    if (undefined === object[firstElem]) {
        return undefined;
    }

    if (restElems.length === 0) {
        return object[firstElem];
    }

    return get(object[firstElem], restElems);
}

/**
 * Sets a deeply-nested property value from an object, given a 'path'
 * of property names or array indices. Path elements are created if
 * not there already. Does not mutate the given object.
 */

export function set(object: any, [ firstElem, ...restElems ]: Array<string | number>, value: any): Object {

    // If this is an ImmutableJS structure, use existing setIn function
    if ('function' === typeof (object[firstElem] || {}).setIn) {
        return {
            ...object,
            [firstElem]: object[firstElem].setIn(restElems, value),
        }
    }

    return {
        ...object,
        [firstElem]: restElems.length === 0 ? value : set(object[firstElem] || {}, restElems, value),
    };
}
