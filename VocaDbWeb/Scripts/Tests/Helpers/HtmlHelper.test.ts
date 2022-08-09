import { HtmlHelper } from '@/Helpers/HtmlHelper';

var testBoldAndHtmlEncode = (
	text: string,
	term: string,
	expected: string,
): void => {
	var actual = HtmlHelper.boldAndHtmlEncode(text, term);
	expect(actual, 'with term ' + term).toBe(expected);
};

test('boldAndHtmlEncode match, no HTML', () => {
	testBoldAndHtmlEncode('Tripshots', 'Trip', '<b>Trip</b>shots');
});

test('boldAndHtmlEncode no match, no HTML', () => {
	testBoldAndHtmlEncode('Tripshots', 'Minato', 'Tripshots');
});

test('boldAndHtmlEncode no match, text has HTML', () => {
	testBoldAndHtmlEncode(
		'Sentaku <love or dead>',
		'Nebula',
		'Sentaku &lt;love or dead&gt;',
	);
});

test('boldAndHtmlEncode match outside HTML, text has HTML', () => {
	testBoldAndHtmlEncode(
		'Sentaku <love or dead>',
		'Sen',
		'<b>Sen</b>taku &lt;love or dead&gt;',
	);
});

test('boldAndHtmlEncode match inside HTML, text has HTML', () => {
	testBoldAndHtmlEncode(
		'Sentaku <love or dead>',
		'<love',
		'Sentaku <b>&lt;love</b> or dead&gt;',
	);
});
