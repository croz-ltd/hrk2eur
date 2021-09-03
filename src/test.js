/**
 * @jest-environment jsdom
 */

import { test } from '@jest/globals';
import { matchPrice, DEFAULT_CONFIG } from './main';

test('750HRK => 750HRK (100.22 €)', () => {
    expect(matchPrice('750HRK')).toBe('750HRK (100,22 €)');
});

test('HRK 750 => HRK 750 (100.22 €)', () => {
    expect(matchPrice('HRK 750')).toBe('HRK 750 (100,22 €)');
});

test('750kn => 750kn (100.22 €)', () => {
    expect(matchPrice('750kn')).toBe('750kn (100,22 €)');
});

test('kn750 => kn750 (100.22 €)', () => {
    expect(matchPrice('kn750')).toBe('kn750 (100,22 €)');
});

test('10.000,00 kn => 10.000,00 kn (1336.32 €)', () => {
    expect(matchPrice('10.000,00 kn')).toBe('10.000,00 kn (1.336,32 €)');
});

test('10,000.00 kn => 10,000.00 kn (1336.32 €)', () => {
    expect(matchPrice('10,000.00 kn')).toBe('10,000.00 kn (1,336.32 €)');
});

test('120.99 HRK => 120.99 HRK (16.17 €)', () => {
    expect(matchPrice('120.99 HRK')).toBe('120.99 HRK (16.17 €)');
});

test('In sentence', () => {
    expect(matchPrice('Price is 750 HRK, with included VAT'))
        .toBe('Price is 750 HRK (100,22 €), with included VAT');
});

test('Multiple in sentence', () => {
    expect(matchPrice('Price for adults is 1500 HRK, and for children 750 HRK.'))
        .toBe('Price for adults is 1500 HRK (200,45 €), and for children 750 HRK (100,22 €).');
});

test('No price in input', () => {
   expect(matchPrice('No price in this input.')).toBe('No price in this input.');
});

test('Currency without number', () => {
    expect(matchPrice('Prices are expressed in HRK.')).toBe('Prices are expressed in HRK.');
});

test('Currency without number before parsable amount', () => {
    expect(matchPrice('Prices are expressed in HRK, price is 750kn.'))
        .toBe('Prices are expressed in HRK, price is 750kn (100,22 €).');
});

test('Use custom configuration eurFactor', () => {
   const configuration = { ...DEFAULT_CONFIG, eurFactor: 7.5 };
   expect(matchPrice('750HRK', configuration)).toBe('750HRK (100,00 €)');
});

test('Use custom configuration priceRegexList', () => {
    const configuration = { ...DEFAULT_CONFIG, priceRegexList: [] };
    expect(matchPrice('750HRK', configuration)).toBe('750HRK');
});
