/**
 * @jest-environment jsdom
 */

import { test } from '@jest/globals';
import {matchPrice, DEFAULT_CONFIG, utils, matchHtmlPattern} from './main';

const eurToHrkConfiguration = { ...DEFAULT_CONFIG, convertEurToHrk: true };

test('750HRK => 750HRK (99.54 €)', () => {
    expect(matchPrice('750HRK')).toBe('750HRK (99,54 €)');
});

test('100€ => 100€ (753.45 kn)', () => {
    expect(matchPrice('100€', eurToHrkConfiguration)).toBe('100€ (753,45 kn)');
});

test('HRK 750 => HRK 750 (99.54 €)', () => {
    expect(matchPrice('HRK 750')).toBe('HRK 750 (99,54 €)');
});

test('€ 100 => € 100 (753.45 kn)', () => {
    expect(matchPrice('€ 100', eurToHrkConfiguration)).toBe('€ 100 (753,45 kn)');
});

test('750kn => 750kn (99.54 €)', () => {
    expect(matchPrice('750kn')).toBe('750kn (99,54 €)');
});

test('100EUR => 100EUR (753.45 kn)', () => {
    expect(matchPrice('100EUR', eurToHrkConfiguration)).toBe('100EUR (753,45 kn)');
});

test('kn750 => kn750 (99.54 €)', () => {
    expect(matchPrice('kn750')).toBe('kn750 (99,54 €)');
});

test('EUR 100 => EUR 100 (753.45 kn)', () => {
    expect(matchPrice('EUR 100', eurToHrkConfiguration)).toBe('EUR 100 (753,45 kn)');
});

test('10.000,00 kn => 10.000,00 kn (1327.23 €)', () => {
    expect(matchPrice('10.000,00 kn')).toBe('10.000,00 kn (1.327,23 €)');
});

test('1.000,00 EUR => 1.000,00 EUR (7534.50 kn)', () => {
    expect(matchPrice('1.000,00 EUR', eurToHrkConfiguration)).toBe('1.000,00 EUR (7.534,50 kn)');
});

test('10,000.00 kn => 10,000.00 kn (1327.23 €)', () => {
    expect(matchPrice('10,000.00 kn')).toBe('10,000.00 kn (1,327.23 €)');
});

test('1,000.00 eur => 1,000.00 EUR (7534.50 kn)', () => {
    expect(matchPrice('1,000.00 eur', eurToHrkConfiguration)).toBe('1,000.00 eur (7,534.50 kn)');
});

test('120.99 HRK => 120.99 HRK (16.06 €)', () => {
    expect(matchPrice('120.99 HRK')).toBe('120.99 HRK (16.06 €)');
});

test('12.99 EUR => 12.99 EUR (97.87 kn)', () => {
    expect(matchPrice('12.99 EUR', eurToHrkConfiguration)).toBe('12.99 EUR (97.87 kn)');
});

test('In sentence', () => {
    expect(matchPrice('Price is 750 HRK, with included VAT'))
        .toBe('Price is 750 HRK (99,54 €), with included VAT');
});

test('In sentence EUR', () => {
    expect(matchPrice('Price is 100 EUR, with included VAT', eurToHrkConfiguration))
        .toBe('Price is 100 EUR (753,45 kn), with included VAT');
});

test('Multiple in sentence', () => {
    expect(matchPrice('Price for adults is 1500 HRK, and for children 750 HRK.'))
        .toBe('Price for adults is 1500 HRK (199,08 €), and for children 750 HRK (99,54 €).');
});

test('Multiple in sentence EUR', () => {
    expect(matchPrice('Price for adults is 200 €, and for children 100 €.', eurToHrkConfiguration))
        .toBe('Price for adults is 200 € (1.506,90 kn), and for children 100 € (753,45 kn).');
});

test('No price in input', () => {
   expect(matchPrice('No price in this input.')).toBe('No price in this input.');
});

test('No price in input EUR', () => {
    expect(matchPrice('No price in this input.', eurToHrkConfiguration)).toBe('No price in this input.');
});

test('Currency without number', () => {
    expect(matchPrice('Prices are expressed in HRK.')).toBe('Prices are expressed in HRK.');
});

test('Currency without number EUR', () => {
    expect(matchPrice('Prices are expressed in EUR.', eurToHrkConfiguration)).toBe('Prices are expressed in EUR.');
});

test('Currency without number before parsable amount', () => {
    expect(matchPrice('Prices are expressed in HRK, price is 750kn.'))
        .toBe('Prices are expressed in HRK, price is 750kn (99,54 €).');
});

test('Currency without number before parsable amount EUR', () => {
    expect(matchPrice('Prices are expressed in EUR, price is 100€.', eurToHrkConfiguration))
        .toBe('Prices are expressed in EUR, price is 100€ (753,45 kn).');
});

test('Use custom configuration eurFactor', () => {
   const configuration = { ...DEFAULT_CONFIG, eurFactor: 7.5 };
   expect(matchPrice('750HRK', configuration)).toBe('750HRK (100,00 €)');
});

test('Use custom configuration eurFactor EUR', () => {
    const configuration = { ...eurToHrkConfiguration, eurFactor: 7.5 };
    expect(matchPrice('100Eur', configuration)).toBe('100Eur (750,00 kn)');
});

test('Use custom configuration priceRegexList', () => {
    const configuration = { ...DEFAULT_CONFIG, priceRegexList: [] };
    expect(matchPrice('750HRK', configuration)).toBe('750HRK');
});

test('Use custom configuration eurPriceRegexList', () => {
    const configuration = { ...eurToHrkConfiguration, eurPriceRegexList: [] };
    expect(matchPrice('750EUR', configuration)).toBe('750EUR');
});

test('Use custom configuration isEurPrimary', () => {
   const configuration = { ...DEFAULT_CONFIG, isEurPrimary: true };
   expect(matchPrice('750 HRK', configuration)).toBe('99,54 € (750 HRK)');
});

test('Skip already converted text HRK.', () => {
    const configuration1 = { ...DEFAULT_CONFIG, isEurPrimary: true };
    expect(matchPrice('99,54 € (750 HRK)', configuration1)).toBe(null);

    const configuration2 = { ...DEFAULT_CONFIG };
    expect(matchPrice('750 HRK (99,54 €)', configuration2)).toBe(null);
});

test('Skip already converted text EUR.', () => {
    expect(matchPrice('100,00 € (753,45 kn)', eurToHrkConfiguration)).toBe(null);
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


test('Check custom html pattern EUR', () => {
    const element = document.createElement('div')
    element.innerHTML = `
        <span class="price--eur">11</span>
        <div class="price__ul">
            <span class="price--cent">99</span>
            <small class="price--c">€/kom</small>
        </div>`;
    const regex = /^<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<small[^>]*>€\/kom<\/small>\s*<\/div>\s*<\/div>$/;
    const replaceFunction = (node) => {
        const eur = node.getElementsByClassName("price--eur")[0];
        const cent = node.getElementsByClassName("price--cent")[0];
        const price = parseFloat(eur.innerHTML + "." + cent.innerHTML);
        const priceKn = utils.convertToHrk(price);
        const kn = priceKn.split(".")[0];
        const lp = priceKn.split(".")[1];
        eur.innerHTML = kn;
        cent.innerHTML = lp;
        node.getElementsByClassName("price--c")[0].innerHTML = "kn/kom"
        return node;
    }

    const configuration = { ...eurToHrkConfiguration, htmlMatchers: [
            { regex: regex, replaceHtml: replaceFunction }
        ]};
    expect(matchHtmlPattern(configuration, element).innerHTML).toBe(`
        <span class="price--eur">90</span>
        <div class="price__ul">
            <span class="price--cent">34</span>
            <small class="price--c">kn/kom</small>
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

test('Skip already converted HTML price EUR', () => {
    const element = document.createElement('div')
    element.innerHTML = `
        <span class="price--eur">90</span>
        <div class="price__ul">
            <span class="price--cent">34</span>
            <small class="price--c">kn/kom</small>
        </div>`;
    element.setAttribute("euro-converted", true);
    const regex = /^<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<div[^>]*>\s*<span[^>]*>\d+<\/span>\s*<small[^>]*>€\/kom<\/small>\s*<\/div>\s*<\/div>$/;
    const replaceFunction = (node) => {
        const eur = node.getElementsByClassName("price--eur")[0];
        const cent = node.getElementsByClassName("price--cent")[0];
        const price = parseFloat(eur.innerHTML + "." + cent.innerHTML);
        const priceKn = utils.convertToHrk(price);
        const kn = priceKn.split(".")[0];
        const lp = priceKn.split(".")[1];
        eur.innerHTML = kn;
        cent.innerHTML = lp;
        node.getElementsByClassName("price--c")[0].innerHTML = "kn/kom"
        return node;
    }

    const configuration = { ...eurToHrkConfiguration, htmlMatchers: [
            { regex: regex, replaceHtml: replaceFunction }
        ]};
    expect(matchHtmlPattern(configuration, element)).toBe(null);
});

test('Switch mode to EUR -> HRK automatically if euro is introduced and autoSwitch flag is  set', () => {
    const configuration = { ...DEFAULT_CONFIG, autoSwitchOnEurIntroduction: true, eurIntroductionDate: new Date('2022-10-10')};
    expect(matchPrice('100€', configuration)).toBe('100€ (753,45 kn)');
    expect(matchPrice('750HRK', configuration)).toBe('750HRK');
});

test('Do not switch mode to EUR -> HRK automatically if euro is introduced and autoSwitch flag is not set', () => {
    const configuration = { ...DEFAULT_CONFIG, eurIntroductionDate: new Date('2022-10-10')};
    expect(matchPrice('100€', configuration)).toBe('100€');
    expect(matchPrice('750HRK', configuration)).toBe('750HRK (99,54 €)');
});
