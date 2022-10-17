const EUR_FACTOR = 7.53450;
const TEXT_ONLY_NODES_TO_CHECK = ['span', 'b', 'p', 'strong', 'form', 'div', 'li', 'a', 'option'];
const OTHER_NODES_TO_CHECK = ['div', 'dd', 'td', 'ul', 'span', 'p', 's'];
const HRK_TO_EUR_REGEXES = [
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, decimalSeparator: ',', thousandSeparator: '.' },  // HRK 2.000,00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, decimalSeparator: '.', thousandSeparator: ',' }, // HRK 2,000.00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9.]*))/, priceIndex: 3, thousandSeparator: '.' }, // HRK 1.000
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9,]*))/, priceIndex: 3, thousandSeparator: ',' }, // HRK 20,000
    { regex: /(([-|+]?[0-9.]+,[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: ',', thousandSeparator: '.' }, // 2.000,00 HRK
    { regex: /(([-|+]?[0-9,]+\.[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: '.', thousandSeparator: ',' }, // 2,000.00 HRK
    { regex: /(([-|+]?[0-9][0-9.]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: '.' }, // 20.000 kn
    { regex: /(([-|+]?[0-9][0-9,]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: ',' }, // 20,000 kn

];
const EUR_TO_HRK_REGEXES = [
    { regex: /((€|EUR|Eur|eur)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, decimalSeparator: ',', thousandSeparator: '.' },  // € 2.000,00
    { regex: /((€|EUR|Eur|eur)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, decimalSeparator: '.', thousandSeparator: ',' }, // € 2,000.00
    { regex: /((€|EUR|Eur|eur)\s*([0-9][0-9.]*))/, priceIndex: 3, thousandSeparator: '.' }, // € 1.000
    { regex: /((€|EUR|Eur|eur)\s*([0-9][0-9,]*))/, priceIndex: 3, thousandSeparator: ',' }, // € 20,000
    { regex: /(([-|+]?[0-9.]+,[0-9]{2})\s*(€|EUR|Eur|eur))/, priceIndex: 2, decimalSeparator: ',', thousandSeparator: '.' }, // 2.000,00 €
    { regex: /(([-|+]?[0-9,]+\.[0-9]{2})\s*(€|EUR|Eur|eur))/, priceIndex: 2, decimalSeparator: '.', thousandSeparator: ',' }, // 2,000.00 €
    { regex: /(([-|+]?[0-9][0-9.]*)\s*(€|EUR|Eur|eur))/, priceIndex: 2, thousandSeparator: '.' }, // 20.000 €
    { regex: /(([-|+]?[0-9][0-9,]*)\s*(€|EUR|Eur|eur))/, priceIndex: 2, thousandSeparator: ',' }, // 20,000 €

];
const OBSERVER_OPTIONS = { childList: true, subtree: true };

const OBSERVER_ENABLED = true;

const DEFAULT_CONFIG = {
    isEurPrimary: false,
    convertEurToHrk: false,
    textNodesToCheck: TEXT_ONLY_NODES_TO_CHECK,
    otherNodesToCheck: OTHER_NODES_TO_CHECK,
    eurFactor: EUR_FACTOR,
    priceRegexList: HRK_TO_EUR_REGEXES,
    eurPriceRegexList: EUR_TO_HRK_REGEXES,
    htmlMatchers: [],
    observerOptions: OBSERVER_OPTIONS,
	  observerEnabled: OBSERVER_ENABLED,
};

function maxMatch(match) {
    return !match ? 0 : match[0].length;
}

function escapeRegexDot(s) {
    return s === '.' ? '\\.' : s;
}

function format(amount, decimalSeparator = ',', thousandSeparator = '.') {
    let formattedAmount = amount;
    if (decimalSeparator === ',') {
        formattedAmount = formattedAmount.replace('.', ',');
    }
    if (thousandSeparator) {
        formattedAmount = formattedAmount.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator);
    }
    return formattedAmount;
}

function matchPrice(text, configuration = DEFAULT_CONFIG) {
    if (!configuration.convertEurToHrk) {
        if (configuration.isEurPrimary ? text.includes('€ (') : text.includes('€)')) { // skip already switched text
            return null;
        }
    } else if (configuration.isEurPrimary ? text.includes('kn)') : text.includes('kn (')) { // skip already switched text
        return null;
    }

    let bestMatchLength = 0;
    let number;
    let regex;
    let resultText = '';
    let currentText = text;
    let regexList = configuration.convertEurToHrk ? configuration.eurPriceRegexList : configuration.priceRegexList;

    do {
        regexList.forEach(listRegex => {
            const match = currentText.match(listRegex.regex);
            if (match && (maxMatch(match) > bestMatchLength)) {
                if (match.length > bestMatchLength) bestMatchLength = maxMatch(match);
                let cleanedString = match[listRegex.priceIndex];
                if (listRegex.thousandSeparator) {
                    cleanedString = cleanedString.replace(new RegExp(escapeRegexDot(listRegex.thousandSeparator), 'g'), '');
                }
                if (listRegex.decimalSeparator && listRegex.decimalSeparator === ',') {
                    cleanedString = cleanedString.replace(new RegExp(escapeRegexDot(listRegex.decimalSeparator), 'g'), '.');
                }
                number = parseFloat(cleanedString);
                regex = listRegex;
            }
        });
        if (bestMatchLength !== 0 && !Number.isNaN(number)) {
            const newValue = format(
                configuration.convertEurToHrk ? convertToHrk(number, configuration.eurFactor) : convertToEur(number, configuration.eurFactor),
                regex.decimalSeparator,
                regex.thousandSeparator
            );
            let newText = ''
            const updatedText = currentText.replace(regex.regex, (match, p1) => {
                newText = configuration.convertEurToHrk ? convertTextToHrk(newValue, p1, configuration) : convertTextToEur(newValue, p1, configuration);
                return newText;
            });
            const lastChangedCharIndex = updatedText.indexOf(newText) + newText.length;
            resultText += updatedText.substring(0, lastChangedCharIndex);
            currentText = updatedText.substring(lastChangedCharIndex);

            regex = null;
            number = null;
            bestMatchLength = 0;
        } else if (bestMatchLength === 0) {
            resultText += currentText;
            currentText = '';
        }
    } while (currentText.length > 0);

    return resultText;
}

function replacePrice(node, configuration) {
    const result = matchPrice(node.textContent, configuration);
    if (result && result.length > 0 && result.length !== node.textContent.length) {
        node.textContent = result;
    }
}

function replacePrices(configuration) {
    const textOnlyNodes = getMapOfNodes(configuration.textNodesToCheck);

    for (const node of textOnlyNodes) {
        if (node.childNodes && node.childNodes.length === 0) {
            continue;
        }

        for (const textNode of node.childNodes) {
            if (textNode.nodeType !== Node.TEXT_NODE) {
                continue;
            }

            replacePrice(textNode, configuration);
        }
    }

    const otherNodes = getMapOfNodes(configuration.otherNodesToCheck);

    for (const node of otherNodes) {
        if (node.childNodes && node.childNodes.length !== 1 ||
            node.childNodes[0].nodeType !== Node.TEXT_NODE) {
            replaceHtml(configuration, node);
            continue;
        }

        replacePrice(node, configuration);
    }
}

function getMapOfNodes(nodes) {
    return nodes.flatMap(tagName => Array.from(document.getElementsByTagName(tagName)));
}

function replaceHtml(configuration, div) {
    const result = matchHtmlPattern(configuration, div);
    if (result !== null) {
        const insertBeforeDiv = (!configuration.convertEurToHrk && configuration.isEurPrimary) || (configuration.convertEurToHrk && !configuration.isEurPrimary);
        div.parentNode.insertBefore(result, insertBeforeDiv ? div : div.nextSibling);
    }
}

function parseNumber(numberString) {
    if (numberString.match(/^[-|+]?[0-9.]+(,[0-9]{2})?$/)) {
        return parseFloat(numberString.replace(/\./g, '').replace(',', '.').replace('+', ''));
    }
    if (numberString.match(/^[-|+]?[0-9,]+(\.[0-9]{2})?$/)) {
        return parseFloat(numberString.replace(',', '').replace('+', ''));
    }
}

function findSubNodeIndex(node, regex) {
    for (let i = 0; i < node.childNodes.length; i++) {
        if (node.childNodes[i].textContent.match(regex)) {
            return i;
        }
    }
    return null;
}

function convertToEur(number, eurFactor = EUR_FACTOR) {
    return (number / eurFactor).toFixed(2);
}

function convertToHrk(number, eurFactor = EUR_FACTOR) {
    return (number * eurFactor).toFixed(2);
}

function convertTextToEur(newValue, p1, configuration = DEFAULT_CONFIG) {
    if (configuration.isEurPrimary) {
        return newValue + ' € ('  + p1 + ')';
    } else {
        return p1 + ' (' + newValue + ' €)';
    }
}

function convertTextToHrk(newValue, p1, configuration = DEFAULT_CONFIG) {
    if (configuration.isEurPrimary) {
        return p1 + ' (' + newValue + ' kn)';
    } else {
        return newValue + ' kn ('  + p1 + ')';
    }
}

const utils = { convertToEur, convertToHrk, findSubNodeIndex, parseNumber };

function matchHtmlPattern(configuration, input) {
    if (input.hasAttribute('euro-converted')) {
        return null;
    }

    for (let matcher of configuration.htmlMatchers) {
        if (input.outerHTML.match(matcher.regex)) {
            let clone = input.cloneNode(true);
            clone = matcher.replaceHtml(clone);
            input.setAttribute('euro-converted', true);

            return clone;
        }
    }

    return null;
}

/**
 *
 * @param configuration configuration of the watching function. Possible configurable options are:
 *  - isEurPrimary - flag that puts price in EUR in the primary place (before HRK price for text, and
 *                  before HRK element for HTML)
 *  - convertEurToHrk - flag that switches conversion from EUR to HRK (checks for prices in EUR and converts them to HRK)
 *  - textNodesToCheck - list of strings representing which text only html tags to check
 *  - otherNodesToCheck - list of strings representing which container html tags to check
 *  - eurFactor - middle rate of the HRK to EUR, used for calculating equivalent
 *  - priceRegexList - list of objects which include regexes to check the prices, shaped like this:
 *      - regex: regex for matching text, must include a group for currency and amount
 *      - priceIndex: index of the group for the amount
 *      - decimalSeparator: character used for decimal separation
 *      - thousandSeparator: character user for separating thousands
 *  - eurPriceRegexList - list of regexes for conversion from EUR to HRK (only applicable if convertEurToHrk is true)
 *  - observerOptions - object of options sent to the MutationObserver
 */
function watchPrices(configuration) {
    const finalConfig = { ...DEFAULT_CONFIG, ...(configuration || {}) };

    replacePrices(finalConfig);
	  if (finalConfig.observerEnabled) {
		    const observeCallback = replacePrices.bind(this, finalConfig);

		    const mutationObserver = new MutationObserver(observeCallback);
		    mutationObserver.observe(document.body, finalConfig.observerOptions);
	  }
}

export { watchPrices, matchPrice, matchHtmlPattern, utils, DEFAULT_CONFIG };
