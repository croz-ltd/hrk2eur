const EUR_FACTOR = 7.53450;
const TEXT_ONLY_NODES_TO_CHECK = ['span', 'b', 'p', 'strong'];
const OTHER_NODES_TO_CHECK = ['div', 'dd', 'td', 's'];
const REGEXES = [
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, decimalSeparator: ',', thousandSeparator: '.' },  // HRK 2.000,00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, decimalSeparator: '.', thousandSeparator: ',' }, // HRK 2,000.00
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9.]*))/, priceIndex: 3, thousandSeparator: '.' }, // HRK 1.000
    { regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9][0-9,]*))/, priceIndex: 3, thousandSeparator: ',' }, // HRK 20,000
    { regex: /(([0-9.]+,[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: ',', thousandSeparator: '.' }, // 2.000,00 HRK
    { regex: /(([0-9,]+\.[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, decimalSeparator: '.', thousandSeparator: ',' }, // 2,000.00 HRK
    { regex: /(([0-9][0-9.]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: '.' }, // 20.000 kn
    { regex: /(([0-9][0-9,]*)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, thousandSeparator: ',' }, // 20,000 kn
];
const OBSERVER_OPTIONS = { childList: true, subtree: true };

const DEFAULT_CONFIG = {
    textNodesToCheck: TEXT_ONLY_NODES_TO_CHECK,
    otherNodesToCheck: OTHER_NODES_TO_CHECK,
    eurFactor: EUR_FACTOR,
    priceRegexList: REGEXES,
    observerOptions: OBSERVER_OPTIONS,
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
    if (text.includes('€)')) { // skip already switched text
        return null;
    }

    let bestMatchLength = 0;
    let number;
    let regex;
    let resultText = '';
    let currentText = text;

    do {
        configuration.priceRegexList.forEach(listRegex => {
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
                (number / configuration.eurFactor).toFixed(2),
                regex.decimalSeparator,
                regex.thousandSeparator
            );
            let newText = ''
            const updatedText = currentText.replace(regex.regex, (match, p1) => {
                newText = p1 + ' (' + newValue + ' €)';
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
            continue;
        }

        replacePrice(node, configuration);
    }
}

function getMapOfNodes(nodes) {
    return nodes.flatMap(tagName => Array.from(document.getElementsByTagName(tagName)));
}

/**
 *
 * @param configuration configuration of the watching function. Possible configurable options are:
 *  - textNodesToCheck - list of strings representing which text only html tags to check
 *  - otherNodesToCheck - list of strings representing which container html tags to check
 *  - eurFactor - middle rate of the HRK to EUR, used for calculating equivalent
 *  - priceRegexList - list of objects which include regexes to check the prices, shaped like this:
 *      - regex: regex for matching text, must include a group for currency and amount
 *      - priceIndex: index of the group for the amount
 *      - decimalSeparator: character used for decimal separation
 *      - thousandSeparator: character user for separating thousands
 *  - observerOptions - object of options sent to the MutationObserver
 */
function watchPrices(configuration) {
    const finalConfig = { ...DEFAULT_CONFIG, ...(configuration || {}) }

    replacePrices(finalConfig);
    const observeCallback = replacePrices.bind(this, finalConfig);

    const mutationObserver = new MutationObserver(observeCallback);
    mutationObserver.observe(document.body, finalConfig.observerOptions);
}

export { watchPrices, matchPrice, DEFAULT_CONFIG };
