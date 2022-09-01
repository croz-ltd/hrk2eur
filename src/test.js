/**
 * @jest-environment jsdom
 */

import { test } from '@jest/globals';
import {matchPrice, DEFAULT_CONFIG, utils, matchHtmlPattern} from './main';

test('750HRK => 750HRK (99.54 €)', () => {
    expect(matchPrice('750HRK')).toBe('750HRK (99,54 €)');
});

test('HRK 750 => HRK 750 (99.54 €)', () => {
    expect(matchPrice('HRK 750')).toBe('HRK 750 (99,54 €)');
});

test('750kn => 750kn (99.54 €)', () => {
    expect(matchPrice('750kn')).toBe('750kn (99,54 €)');
});

test('kn750 => kn750 (99.54 €)', () => {
    expect(matchPrice('kn750')).toBe('kn750 (99,54 €)');
});

test('10.000,00 kn => 10.000,00 kn (1327.23 €)', () => {
    expect(matchPrice('10.000,00 kn')).toBe('10.000,00 kn (1.327,23 €)');
});

test('10,000.00 kn => 10,000.00 kn (1327.23 €)', () => {
    expect(matchPrice('10,000.00 kn')).toBe('10,000.00 kn (1,327.23 €)');
});

test('120.99 HRK => 120.99 HRK (16.06 €)', () => {
    expect(matchPrice('120.99 HRK')).toBe('120.99 HRK (16.06 €)');
});

test('In sentence', () => {
    expect(matchPrice('Price is 750 HRK, with included VAT'))
        .toBe('Price is 750 HRK (99,54 €), with included VAT');
});

test('Multiple in sentence', () => {
    expect(matchPrice('Price for adults is 1500 HRK, and for children 750 HRK.'))
        .toBe('Price for adults is 1500 HRK (199,08 €), and for children 750 HRK (99,54 €).');
});

test('No price in input', () => {
   expect(matchPrice('No price in this input.')).toBe('No price in this input.');
});

test('Currency without number', () => {
    expect(matchPrice('Prices are expressed in HRK.')).toBe('Prices are expressed in HRK.');
});

test('Currency without number before parsable amount', () => {
    expect(matchPrice('Prices are expressed in HRK, price is 750kn.'))
        .toBe('Prices are expressed in HRK, price is 750kn (99,54 €).');
});

test('Use custom configuration eurFactor', () => {
   const configuration = { ...DEFAULT_CONFIG, eurFactor: 7.5 };
   expect(matchPrice('750HRK', configuration)).toBe('750HRK (100,00 €)');
});

test('Use custom configuration priceRegexList', () => {
    const configuration = { ...DEFAULT_CONFIG, priceRegexList: [] };
    expect(matchPrice('750HRK', configuration)).toBe('750HRK');
});

test('Use custom configuration isEurPrimary', () => {
   const configuration = { ...DEFAULT_CONFIG, isEurPrimary: true };
   expect(matchPrice('750 HRK', configuration)).toBe('99,54 € (750 HRK)');
});

test('Skip already converted text.', () => {
    const configuration1 = { ...DEFAULT_CONFIG, isEurPrimary: true };
    expect(matchPrice('99,54 € (750 HRK)', configuration1)).toBe(null);

    const configuration2 = { ...DEFAULT_CONFIG };
    expect(matchPrice('750 HRK (99,54 €)', configuration2)).toBe(null);
});

test('Check custom html pattern', () => {
    const element = document.createElement('div')
    element.innerHTML = `
        <span class="price--kn">70</span>
        <div class="price__ul">
            <span class="price--li">99</span>
            <small class="price--c">kn/kom</small>
        </div>`;
    const regex = /^<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<small[^>]*>kn\/kom<\/small>\s*<\/div>\s*<\/div>$/;
    const replaceFunction = (node) => {
        const kn = node.getElementsByClassName("price--kn")[0];
        const lp = node.getElementsByClassName("price--li")[0];
        const price = parseFloat(kn.innerHTML + "." + lp.innerHTML);
        const priceEur = utils.convertToEur(price);
        const eurs = priceEur.split(".")[0];
        const cents = priceEur.split(".")[1];
        kn.innerHTML = eurs;
        lp.innerHTML = cents;
        node.getElementsByClassName("price--c")[0].innerHTML = "€/kom"
        return node;
    }

    const configuration = { ...DEFAULT_CONFIG, htmlMatchers: [
        { regex: regex, replaceHtml: replaceFunction }
    ]};
    expect(matchHtmlPattern(configuration, element).innerHTML).toBe(`
        <span class="price--kn">9</span>
        <div class="price__ul">
            <span class="price--li">42</span>
            <small class="price--c">€/kom</small>
        </div>`)
});

test('Skip already converted HTML price', () => {
    const element = document.createElement('div')
    element.innerHTML = `
        <span class="price--kn">70</span>
        <div class="price__ul">
            <span class="price--li">99</span>
            <small class="price--c">kn/kom</small>
        </div>`;
    element.setAttribute("euro-converted", true);
    const regex = /^<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<small[^>]*>kn\/kom<\/small>\s*<\/div>\s*<\/div>$/;
    const replaceFunction = (node) => {
        const kn = node.getElementsByClassName("price--kn")[0];
        const lp = node.getElementsByClassName("price--li")[0];
        const price = parseFloat(kn.innerHTML + "." + lp.innerHTML);
        const priceEur = utils.convertToEur(price);
        const eurs = priceEur.split(".")[0];
        const cents = priceEur.split(".")[1];
        kn.innerHTML = eurs;
        lp.innerHTML = cents;
        node.getElementsByClassName("price--c")[0].innerHTML = "€/kom"
        return node;
    }

    const configuration = { ...DEFAULT_CONFIG, htmlMatchers: [
            { regex: regex, replaceHtml: replaceFunction }
    ]};
    expect(matchHtmlPattern(configuration, element)).toBe(null);
});
