# HRK 2 EUR Converter

By joining the European Union in 2013 Croatia also accepted an obligation to adopt Euro as the official national
 currency replacing Kuna. The current national plan is to replace Kuna with Euro at midnight 01.01.2023.

A rough timetable is as follows:

1. ~ 06.2022 fixed exchange rate at which conversion will be made is defined
2. 01.07.2022 - 31.12.2022 - all documents (price lists etc.) should include values converted to EUR alongside HRK values
3. 01.01.2023. - switchover of all currency to EUR
4. 01.01.2023 - 31.12.2023 - all documents (price lists etc.) should include values converted to HRK alongside EUR values

The same is true for websites, shops and other web applications. Trying to find a simple solution to the challenge that many web 
admins and developers will have to resolve, CROZ's team came up with an idea and developed a software solution in line with this vision:

- **FOR** web app and website owners and developers
- **WHO WILL**, due to the Croatian transition from Croatian kuna to EUR, have to display all amounts in both currencies on their websites
- **OUR** "Very Smart Currency Converter (smile)" 
- **IS** a simple JavaScript script
- **THAT** automatically finds all amounts in HRK (and in the second phase of the transition in EUR) on web pages, 
calculate and display the counter-values in other currency.
- **INSTEAD OF** going through the entire development cycle of existing web applications and pages 
- **OUR PRODUCT IS** easy to install, simple to configure, and it is capable to change the mode of operation 
depending on the legal deadlines without compromising the look & feel of the website.

## Usage

This script can be used as an `@croz/hrk2eur` package [npm](https://www.npmjs.com/package/@croz/hrk2eur) or as a `<script>` tag from CDN.

To use it in your npm project, type `npm install @croz/hrk2eur`, and add 
```
import {watchPrices} from @croz/hrk2eur

watchPrices();
``` 
to your main script.


For a CDN usage add the following snippet at the end of your html file: 

```
<script src="https://unpkg.com/@croz/hrk2eur@1.3.1/dist/umd/main.js"></script>
<script>hrk2eur.watchPrices()</script>
```

If you want to have EUR as a primary value, as it's recommended, use:

```
import {watchPrices} from @croz/hrk2eur

watchPrices({ isEurPrimary: true });
``` 
for npm or:

```
<script src="https://unpkg.com/@croz/hrk2eur@1.3.1/dist/umd/main.js"></script>
<script>hrk2eur.watchPrices({ isEurPrimary: true })</script>
```
for CDN usage.

#### NEW 

New feature in the script is conversion from EUR to HRK intended for usage after 1.1.2023. when EURO is introduced.
You can set it manually, using `convertEurToHrk` flag, or set it to switch automatically with `autoSwitchOnEurIntroduction`.
In this mode script uses `eurPriceRegexList` instead of `priceRegexList`.
**Note** that in this mode script expects that your page is fully migrated to EUR currency, and serves only for showing 
informational purposes. 

```
import {watchPrices} from @croz/hrk2eur

watchPrices({ autoSwitchOnEurIntroduction: true });
``` 
for npm or:

```
<script src="https://unpkg.com/@croz/hrk2eur@1.3.1/dist/umd/main.js"></script>
<script>hrk2eur.watchPrices({ autoSwitchOnEurIntroduction: true })</script>
```
for CDN usage.


## Options

### isEurPrimary

**Type:** `boolean`

**Default:** `false`

**Usage:** Whether to show amount in EUR before amount in HRK. Relevant only if script is in HRK -> EUR mode

### convertEurToHrk - NEW

**Type:** `boolean`

**Default:** `false`

**Usage:** Use it to switch conversion to EUR -> HRK manually

### autoSwitchOnEurIntroduction - NEW

**Type:** `boolean`

**Default:** `false`

**Usage:** Used to make the script automatically switch from HRK -> EUR to EUR -> HRK on EURO introduction date.

### textNodesToCheck

**Type:** `Array`

**Default:** `['span', 'b', 'p', 'strong', 'form', 'div', 'li', 'a', 'option']`

**Usage:** List of strings representing which text only html tags to check.

### otherNodesToCheck

**Type:** `Array`

**Default:** `['div', 'dd', 'td', 'ul', 'span', 'p', 's']`

**Usage:** List of strings representing which container html tags to check.

### eurFactor

**Type:** `Number`

**Default:** `7.53450`

**Usage:** Middle rate of the HRK to EUR, used for calculating equivalent.

### eurIntroductionDate

**Type:** `Date`

**Default:** `2023-01-01`

**Usage:** Date of the introduction of EURO in Croatia. Available for changing for easier testing of `autoSwitchOnEurIntroduction` flag.

### priceRegexList

**Type:** `Array`

**Default:** 
```javascript
[
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, decimalSeparator: ',', thousandSeparator: '.' },  // HRK 2.000,00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, decimalSeparator: '.', thousandSeparator: ',' }, // HRK 2,000.00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9.]*))/, priceIndex: 3, thousandSeparator: '.' }, // HRK 1.000
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9,]*))/, priceIndex: 3, thousandSeparator: ',' }, // HRK 20,000
    { regex: /(([0-9.]+,[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: ',', thousandSeparator: '.' }, // 2.000,00 HRK
    { regex: /(([0-9,]+\.[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: '.', thousandSeparator: ',' }, // 2,000.00 HRK
    { regex: /(([0-9][0-9.]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: '.' }, // 20.000 kn
    { regex: /(([0-9][0-9,]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: ',' }, // 20,000 kn
]
```

**Usage:** List of objects which include regexes to check the prices for HRK -> EUR conversion.

Pass an array of objects, object options:

`regex` - regex for matching text, must include a group for currency and amount

`priceIndex` - index of the group for the amount

`decimalSeparator` - character used for decimal separation

`thousandSeparator` - character user for separating thousands

### eurPriceRegexList

**Type:** `Array`

**Default:**
```javascript
[
    { regex: /((€|EUR|Eur|eur)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, decimalSeparator: ',', thousandSeparator: '.' },  // € 2.000,00
    { regex: /((€|EUR|Eur|eur)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, decimalSeparator: '.', thousandSeparator: ',' }, // € 2,000.00
    { regex: /((€|EUR|Eur|eur)\s*([0-9][0-9.]*))/, priceIndex: 3, thousandSeparator: '.' }, // € 1.000
    { regex: /((€|EUR|Eur|eur)\s*([0-9][0-9,]*))/, priceIndex: 3, thousandSeparator: ',' }, // € 20,000
    { regex: /(([-|+]?[0-9.]+,[0-9]{2})\s*(€|EUR|Eur|eur))/, priceIndex: 2, decimalSeparator: ',', thousandSeparator: '.' }, // 2.000,00 €
    { regex: /(([-|+]?[0-9,]+\.[0-9]{2})\s*(€|EUR|Eur|eur))/, priceIndex: 2, decimalSeparator: '.', thousandSeparator: ',' }, // 2,000.00 €
    { regex: /(([-|+]?[0-9][0-9.]*)\s*(€|EUR|Eur|eur))/, priceIndex: 2, thousandSeparator: '.' }, // 20.000 €
    { regex: /(([-|+]?[0-9][0-9,]*)\s*(€|EUR|Eur|eur))/, priceIndex: 2, thousandSeparator: ',' }, // 20,000 €
]
```

**Usage:** List of objects which include regexes to check the prices for EUR -> HRK conversion.

Logic is the same as `priceRegexList`. Ignored if `eurPriceRegexList` and `autoSwitchOnEurIntroduction` are false.

### observerOptions

**Type:** `Object`

**Default:** `{ childList: true, subtree: true }`

**Usage:** Object of options sent to the MutationObserver.
