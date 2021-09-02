const EUR_FACTOR = 7.483221;
const TEXT_ONLY_NODES_TO_CHECK = ['span', 'b', 'p', 'strong'];
const OTHER_NODES_TO_CHECK = ['div', 'dd', 'td'];
const REGEXES = [
    {regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/,  priceIndex: 3, replacementRules: [{old: /\./g, new: ''}, {old: /,/g, new: '.'}]},  // HRK 2.000,00
    {regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, replacementRules: [{old: /,/g, new: ''}]}, // HRK 2,000.00
    {regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/,  priceIndex: 3, replacementRules: [{old: /\./g, new: ''}]}, // HRK 1.000
    {regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+))/,           priceIndex: 3, replacementRules: [{old: /,/g, new: ''}]}, // HRK 20,000
    {regex: /(([0-9.]+,[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/,  priceIndex: 2, replacementRules: [{old: /\./g, new: ''}, {old: /,/g, new: '.'}]}, // 2.000,00 HRK
    {regex: /(([0-9,]+\.[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, replacementRules: [{old: /,/g, new: ''}]}, // 2,000.00 HRK
    {regex: /(([0-9.]+)\s*(KN|kn|Kn|hrk|HRK))/,           priceIndex: 2, replacementRules: [{old: /\./g, new: ''}]}, // 20.000 kn
    {regex: /(([0-9,]+)\s*(KN|kn|Kn|hrk|HRK))/,           priceIndex: 2, replacementRules: [{old: /,/g, new: ''}]}, // 20,000 kn
];

function maxMatch(match) {
    if (!match) return 0;
    return match[0].length;
}

function matchPrice(text) {
    if (text.includes('€)')) {
        return null;
    }

    let bestMatchLength = 0;
    let number;
    let regex;
    let resultText = "";
    let currentText = text;

    do {
        REGEXES.forEach(listRegex => {
            const match = currentText.match(listRegex.regex);
            if (match && (maxMatch(match) > bestMatchLength)) {
                if (match.length > bestMatchLength) bestMatchLength = maxMatch(match);
                let cleanedString = match[listRegex.priceIndex];
                listRegex.replacementRules.forEach(rule => {
                    cleanedString = cleanedString.replace(rule.old, rule.new);
                });
                number = parseFloat(cleanedString);
                regex = listRegex.regex;
            }
        });
        if (bestMatchLength !== 0 && !Number.isNaN(number)) {
            const newValue = (number / EUR_FACTOR).toFixed(2).toString();
            let newText = ""
            const updatedText = currentText.replace(regex, (match, p1, offset, string) => {
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
            currentText = "";
        }
        if (Number.isNaN(number) && bestMatchLength !== 0) { // regex seem to match when only HRK without number is in the text
            break;
        }
    } while (currentText.length > 0);

    return resultText;
}

function replacePrice(div) {
    const result = matchPrice(div.textContent);
    if (result && result.length > 0 && result.length !== div.textContent.length) {
        div.textContent = result;
    }
}

function replacePrices() {

    const textOnlyNodes = TEXT_ONLY_NODES_TO_CHECK.flatMap(tagName => Array.from(document.getElementsByTagName(tagName)));

    for (let node of textOnlyNodes) {
        if (node.childNodes && node.childNodes.length === 0) {
            continue;
        }

        for (let textNode of node.childNodes) {
            if (textNode.nodeType !== Node.TEXT_NODE) {
                continue;
            }

            replacePrice(textNode);
        }
    }

    const otherNodes = OTHER_NODES_TO_CHECK.flatMap(tagName => Array.from(document.getElementsByTagName(tagName)));

    for (let node of otherNodes) {
        if (node.childNodes && node.childNodes.length !== 1 ||
            node.childNodes[0].nodeType !== Node.TEXT_NODE ) {
            continue;
        }

        replacePrice(node);
    }

}

replacePrices();

const mutationObserver = new MutationObserver(replacePrices);

mutationObserver.observe(document.body, {childList: true, subtree: true});

export { matchPrice };
