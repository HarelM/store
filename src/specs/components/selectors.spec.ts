/**
 * Import components
 */

import { getSelectorType } from '../../components/selectors.component';

/**
 * Get selector type of select
 * (property | function | path | nil)
 */

describe('Selectors', () => {
    it('sniffs a string property selector', () =>
        expect(getSelectorType('propName')).toBe('property'));

    it('sniffs a number property selector', () =>
        expect(getSelectorType(3)).toBe('property'));

    it('sniffs a symbol property selector', () =>
        expect(getSelectorType(Symbol('whatever'))).toBe('property'));

    it('sniffs a function selector', () =>
        expect(getSelectorType(state => state)).toBe('function'));

    it('sniffs a path selector', () =>
        expect(getSelectorType([ 'one', 'two' ])).toBe('path'));

    it('sniffs a nil selector (undefined)', () =>
        expect(getSelectorType()).toBe('nil'));
});
