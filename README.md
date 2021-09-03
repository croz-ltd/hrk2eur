# HRK 2 EUR Converter

By joining the European union in 2013 Croatia also accepted an obligation to adopt Euro as the official national
 currency replacing Kuna. The current national plan is to replace Kuna with Euro at midnight 01.01.2023.

A rough timetable is as flows:

1. ~ 06.2022 fixed exchange rate at which conversion will be made is defined
2. 01.07.2022 - 31.12.2022 - all documents (price lists etc.) should include values converted to EUR alongside HRK values
3. 01.01.2023. - switchover of all currency to EUR
4. 01.01.2023 - 30.06.2023 - all documents (price lists etc.) should include values converted to HRK alongside EUR values

The same is true for web sites, shops and other web applications. Trying to find a simple solution to the challange that many web 
admins and developers will have to resolve CROZ's team came with an idea and developed a software solution in line with this vision:

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
<script src="https://unpkg.com/@croz/hrk2eur@1.0.0/dist/umd/main.js"></script>
<script>hrk2eur.watchPrices()</script>
```

 
