/**
 * @jest-environment jsdom
 */

import { test } from '@jest/globals';
import { matchPrice } from './src/main';

test('750HRK => 750HRK (100.00 €)', () => {
    expect(matchPrice("750HRK")).toBe("750HRK (100.00 €)");
});

test('HRK 750 => HRK 750 (100.00 €)', () => {
    expect(matchPrice("HRK 750")).toBe("HRK 750 (100.00 €)");
});

test('750kn => 750kn (100.00 €)', () => {
    expect(matchPrice("750kn")).toBe("750kn (100.00 €)");
});

test('kn750 => kn750 (100.00 €)', () => {
    expect(matchPrice("kn750")).toBe("kn750 (100.00 €)");
});

test('10.000,00 kn => 10.000,00 kn (1333.33 €)', () => {
    expect(matchPrice("10.000,00 kn")).toBe("10.000,00 kn (1333.33 €)");
});

test('10,000.00 kn => 10,000.00 kn (1333.33 €)', () => {
    expect(matchPrice("10,000.00 kn")).toBe("10,000.00 kn (1333.33 €)");
});

test('120.99 HRK => 120.99 HRK (16.13 €)', () => {
    expect(matchPrice("120.99 HRK")).toBe("120.99 HRK (16.13 €)");
});

test('In sentence', () => {
    expect(matchPrice("Cijena je 750 HRK, sa ukljucenim PDVom"))
        .toBe("Cijena je 750 HRK (100.00 €), sa ukljucenim PDVom");
});

test('Multiple in sentence', () => {
    expect(matchPrice("Cijena za odrasle je 1500 HRK, a za djecu 750 HRK."))
        .toBe("Cijena za odrasle je 1500 HRK (200.00 €), a za djecu 750 HRK (100.00 €).");
});
