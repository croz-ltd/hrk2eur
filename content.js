const EUR_FACTOR = 7.5;

const REGEXES = [
	{regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, replacementRules: [{old: '.', new: ''}, {old: ',', new: '.'}]},  // HRK 2.000,00
	{regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+\.[0-9]{2}))/, priceIndex: 3, replacementRules: [{old: ',', new: ''}]}, // HRK 2,000.00
	{regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9.]+,[0-9]{2}))/, priceIndex: 3, replacementRules: [{old: '.', new: ''}]}, // HRK 1.000
	{regex: /((KN|kn|Kn|hrk|HRK)\s*([0-9,]+))/, priceIndex: 3, replacementRules: [{old: ',', new: ''}]}, // HRK 20,000
	{regex: /(([0-9.]+,[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, replacementRules: [{old: '.', new: ''}, {old: ',', new: '.'}]}, // 2.000,00 HRK
	{regex: /(([0-9,]+\.[0-9]{2})\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, replacementRules: [{old: ',', new: ''}]}, // 2,000.00 HRK
	{regex: /(([0-9.]+)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, replacementRules: [{old: '.', new: ''}]}, // 20.000 kn
	{regex: /(([0-9,]+)\s*(KN|kn|Kn|hrk|HRK))/, priceIndex: 2, replacementRules: [{old: ',', new: ''}]}, // 20,000 kn
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
	let resultText = text;
	let currentText = text;

	do {
		REGEXES.forEach(listRegex => {
			const match = text.match(listRegex.regex);
			if (match && (maxMatch(match) > bestMatchLength)) {
				if (match.length > bestMatchLength) bestMatchLength = maxMatch(match);
				let cleanedString = match[listRegex.priceIndex];
				listRegex.replacementRules.forEach(rule => {
					cleanedString = cleanedString.replaceAll(rule.old, rule.new);
				});
				number = parseFloat(cleanedString);
				regex = listRegex.regex;
			}
		});
		if (bestMatchLength !== 0 && !Number.isNaN(number)) {
			const newValue = (number / EUR_FACTOR).toFixed(2).toString();
			resultText = text.replace(regex, (match, p1, offset, string) => {
				return p1 + ' (' + newValue + ' €)';
			});
			return resultText;
		}
		if (Number.isNaN(number) && bestMatchLength !== 0) { // regex seem to match when only HRK without number is in the text
			break;
		}
	} while (bestMatchLength !== 0);

	return resultText;
}

function replacePrice(div) {
	const result = matchPrice(div.textContent);
	if (result && result.length > 0) {
		div.textContent = result;
	}
}

function replacePrices() {

	const textOnlyNodes = [
		...document.getElementsByTagName('span'),
		...document.getElementsByTagName('b'),
		...document.getElementsByTagName('p'),
		...document.getElementsByTagName('strong'),

	];

	for (let div of textOnlyNodes) {
		if (div.childNodes.length === 0) {
			continue;
		}

		for (let node of div.childNodes) {
			if (node.nodeType !== Node.TEXT_NODE) {
				continue;
			}

			replacePrice(node);
		}
	}

	const otherNodes = [
		...document.getElementsByTagName('div'),
		...document.getElementsByTagName('dd'),
		...document.getElementsByTagName('td'),
	]

	for (let div of otherNodes) {
		if (div.childNodes.length !== 1) {
			continue;
		}

		if (div.childNodes[0].nodeType !== Node.TEXT_NODE) {
			continue;
		}

		replacePrice(div);
	}

}

replacePrices();

const mutationObserver = new MutationObserver(replacePrices);

mutationObserver.observe(document.body, {childList: true, attributes: true, subtree: true, attributeOldValue: true, attributeFilter: ['class', 'style']});

