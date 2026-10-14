// Strict mode catches mistakes such as using an undeclared variable.
'use strict';

// HOW TO READ THIS FILE
//
// 1. Test builders:
//    Create the data for math, precision-policy and behavior checks.
//
// 2. groups:
//    Store all questions, answers and explanations.
//
// 3. Helper functions:
//    Perform small jobs such as pressing buttons and comparing values.
//
// 4. runCase:
//    Run ONE question and return its result.
//
// 5. renderResult:
//    Turn ONE result into a visible card.
//
// 6. runSelectedGroup:
//    Coordinate a complete run of the SELECTED group.

// These controls belong to the test page.
var frame = document.getElementById('calcFrame');
var runBtn = document.getElementById('runBtn');
var modeSelect = document.getElementById('modeSelect');

// The iframe contains a different document: calculator.html.
// Two runs must not use that same calculator at the same time.
var running = false;

// Each run receives a separate report number.
var runCounter = 0;


// ------------------------------------------------------------
// 1. Build test data
// ------------------------------------------------------------

// Create a math question. This function does NOT calculate anything.
//
// expr:
//     What to enter.
//
// expected:
//     The independently worked-out answer.
//     Do not ask the calculator to create its own expected answer:
//     a broken calculator could agree with itself and pass.
//
// why:
//     This question's explanation.
//
// note:
//     Optional extra information.
function math(expr, expected, why, note) {
    return {
        name: expr,
        expr: expr,
        expected: expected,
        what:
            'Press C, enter ' + expr +
            ' with the buttons, then press =.',
        why: why,
        note: note || ''
    };
}

// Create a check for an intentional display rule.
//
// expectedDisplay is TEXT because we are checking the screen.
//
// exactAnswer is stored separately.
// This prevents PASS from being mistaken for exact mathematics.
function precisionCheck(expr, expectedDisplay, exactAnswer, why) {
    return {
        kind: 'precision-policy',
        name: 'Intentional precision limit: ' + expr,
        expr: expr,
        expectedDisplay: expectedDisplay,
        exactAnswer: exactAnswer,
        what:
            'Press C, enter ' + expr +
            ' with the buttons, then press =.',
        why: why,
        note:
            'PASS means the display follows the intentional precision rule. ' +
            'It does not mean the displayed value is the exact mathematical answer.'
    };
}

// Create a behavior question.
//
// run is a function stored for later.
// Passing it here does not execute it.
//
// Later, runCase calls test.run(context).
function check(name, what, why, run) {
    return {
        name: name,
        what: what,
        why: why,
        run: run
    };
}


// ------------------------------------------------------------
// 2. Questions
// ------------------------------------------------------------

// These keys match the HTML option values:
// math, practical, full and usability.
//
// Each item in a tests array is one question.
var groups = {
    math: {
        label: '1. Basic operations',
        guide:
            'Start with addition and subtraction, then multiplication and division. ' +
            'In mixed sums, multiply and divide first. ' +
            'Operations with the same priority go from left to right.',
        tests: [
            math(
                '2+3',
                5,
                'Start with 2 counters. Add 3 more: 2 + 3 = 5.'
            ),
            math(
                '9-4',
                5,
                'Start with 9 counters. Take away 4. There are 5 left.'
            ),
            math(
                '0+7',
                7,
                'Adding zero adds nothing, so 7 stays 7.'
            ),
            math(
                '7-7',
                0,
                'Take away all 7 counters. None are left, so the answer is 0.'
            ),
            math(
                '12-5+2',
                9,
                'Addition and subtraction have the same priority. ' +
                'Go left to right: 12 - 5 = 7, then 7 + 2 = 9.'
            ),
            math(
                '10-3-2',
                5,
                'Go left to right: 10 - 3 = 7, then 7 - 2 = 5. ' +
                'Do not combine 3 - 2 first.'
            ),
            math(
                '3*4',
                12,
                'Three groups of 4 make 4 + 4 + 4 = 12.'
            ),
            math(
                '12/3',
                4,
                'Share 12 counters equally among 3 groups. Each group gets 4.'
            ),
            math(
                '0*8',
                0,
                'Zero groups of 8 contain no counters. The answer is 0.'
            ),
            math(
                '0/5',
                0,
                'Share zero counters among 5 groups. Each group gets zero.'
            ),
            math(
                '6/2*3',
                9,
                'Multiplication and division have the same priority. ' +
                'Go left to right: 6 / 2 = 3, then 3 * 3 = 9.'
            ),
            math(
                '24/4/2',
                3,
                'Go left to right: 24 / 4 = 6, then 6 / 2 = 3.'
            ),
            math(
                '2+3*4',
                14,
                'Multiply first: 3 * 4 = 12. Then add: 2 + 12 = 14.'
            ),
            math(
                '20-12/3',
                16,
                'Divide first: 12 / 3 = 4. Then subtract: 20 - 4 = 16.'
            ),
            math(
                '18/3+2*4-1',
                13,
                'First divide and multiply: 18 / 3 = 6 and 2 * 4 = 8. ' +
                'Now go left to right: 6 + 8 - 1 = 14 - 1 = 13.'
            )
        ]
    },

    practical: {
        label: '2. Decimals and signed numbers',
        guide:
            'Check decimal places, numbers below zero, and the signs of answers. ' +
            'Test #32 checks the intentional precision limit: a tiny result is ' +
            'displayed as 0 by design, with the exact answer explained.',
        tests: [
            math(
                '0.1+0.2',
                0.3,
                'One tenth plus two tenths makes three tenths: 0.3.'
            ),
            math(
                '1.5-0.7',
                0.8,
                'Think in tenths: 15 tenths - 7 tenths = 8 tenths, or 0.8.'
            ),
            math(
                '0.1*0.2',
                0.02,
                'One tenth of two tenths is two hundredths: 0.02.'
            ),
            math(
                '5.5/2',
                2.75,
                'Share 5.50 equally into two parts. Each part is 2.75, ' +
                'because 2.75 + 2.75 = 5.50.'
            ),
            math(
                '0.3/0.1',
                3,
                'There are three pieces of size 0.1 in 0.3. So 0.3 / 0.1 = 3.'
            ),
            math(
                '-5+3',
                -2,
                'Start at -5 on a number line. Move 3 steps right. You arrive at -2.'
            ),
            math(
                '3-5',
                -2,
                'Start at 3. Move 5 steps left. You arrive at -2.'
            ),
            math(
                '-5-3',
                -8,
                'Start at -5. Subtracting 3 moves 3 more steps left, to -8.'
            ),
            math(
                '2--3',
                5,
                'Subtracting a negative reverses the direction: ' +
                'move 3 steps right from 2. That gives 5.'
            ),
            math(
                '2*-3',
                -6,
                'Add -3 twice: -3 + -3 = -6. ' +
                'A positive number times a negative number is negative.'
            ),
            math(
                '-2*-3',
                6,
                'A negative times a negative is positive. ' +
                'The size is 2 * 3 = 6, so the answer is 6.'
            ),
            math(
                '-12/3',
                -4,
                'Three equal shares of -12 are -4 each, ' +
                'because -4 + -4 + -4 = -12.'
            ),
            math(
                '-12/-3',
                4,
                'A negative divided by a negative is positive. ' +
                'The size is 12 / 3 = 4.'
            ),
            math(
                '-1.5+0.5',
                -1,
                'Start at -1.5 and move 0.5 right on the number line. You arrive at -1.'
            ),
            math(
                '0.0000001*0.1',
                0.00000001,
                'Multiplying by one tenth divides by 10. Move the decimal point ' +
                'one place left: 0.0000001 becomes 0.00000001.'
            ),
            math(
                '0.0000001*0.1+1',
                1.00000001,
                'Multiply first: 0.0000001 * 0.1 = 0.00000001. ' +
                'Add 1 to get 1.00000001. Keep the tiny part.'
            ),

            // Test #32 checks the chosen precision policy.
            // Its expected DISPLAY is "0".
            // Its exact mathematical answer is recorded separately.
            precisionCheck(
                '0.0000000000001*0.1',
                '0',
                '0.00000000000001',
                'Multiplying by 0.1 divides by 10. The exact answer is 0.00000000000001. ' +
                'This simple calculator intentionally displays 0 instead. ' +
                'When displaying a result, it changes a value less than 0.000000000001 ' +
                'away from the nearest whole number into that whole number. ' +
                'Think of it as choosing not to show a tiny crumb, even though the crumb exists. ' +
                'This rule is defined in app.js, in normalizeFloatingError(), using < 1e-12. ' +
                'formatResult() also keeps at most 15 significant digits, not 15 decimal places. ' +
                'If these small differences matter, do not use this calculator. ' +
                'Use a tool designed for higher precision.'
            ),
            math(
                '0.3-0.2-0.1',
                0,
                'Work in tenths, from left to right: 3 tenths - 2 tenths = 1 tenth. ' +
                'Then 1 tenth - 1 tenth = 0.'
            )
        ]
    },

    full: {
        label: '3. Parentheses and nested parentheses',
        guide:
            'Parentheses tell us which part to solve first. ' +
            'With parentheses inside parentheses, start with the innermost pair ' +
            'and work outward.',
        tests: [
            math(
                '(2+3)*4',
                20,
                'Do the parentheses first: 2 + 3 = 5. Then 5 * 4 = 20.'
            ),
            math(
                '2+(3*4)',
                14,
                'Inside the parentheses, 3 * 4 = 12. Then 2 + 12 = 14.'
            ),
            math(
                '20/(2+3)',
                4,
                'First 2 + 3 = 5. Then share 20 into 5 equal groups: 20 / 5 = 4.'
            ),
            math(
                '(10-2)/(3+1)',
                2,
                'Work out both pairs: 10 - 2 = 8 and 3 + 1 = 4. Then 8 / 4 = 2.'
            ),
            math(
                '((2+3))',
                5,
                'The inner pair gives 2 + 3 = 5. ' +
                'The outer pair adds no operation, so the answer stays 5.'
            ),
            math(
                '2*(3+(4*5))',
                46,
                'Start deepest: 4 * 5 = 20. Next 3 + 20 = 23. Finally 2 * 23 = 46.'
            ),
            math(
                '((2+3)*4)-6',
                14,
                'First 2 + 3 = 5. Then 5 * 4 = 20. Finally 20 - 6 = 14.'
            ),
            math(
                '48/(2*(3+1))',
                6,
                'First 3 + 1 = 4. Then 2 * 4 = 8. Finally 48 / 8 = 6.'
            ),
            math(
                '10-(3-1)',
                8,
                'First 3 - 1 = 2. Then 10 - 2 = 8. ' +
                'The parentheses make us subtract 2 as one amount.'
            ),
            math(
                '10-((3-1)*2)',
                6,
                'First 3 - 1 = 2. Then 2 * 2 = 4. Finally 10 - 4 = 6.'
            ),
            math(
                '-(2+3)',
                -5,
                'First 2 + 3 = 5. ' +
                'The minus outside changes the sign of the whole answer: -5.'
            ),
            math(
                '(-2)*(-3)',
                6,
                'Each pair holds a negative number. ' +
                'A negative times a negative is positive: 2 * 3 = 6.'
            ),
            math(
                '(0.1+0.2)*10',
                3,
                'First 1 tenth + 2 tenths = 3 tenths, or 0.3. Then 0.3 * 10 = 3.'
            ),
            math(
                '((1.5-0.5)*(2+3))/2',
                2.5,
                'First 1.5 - 0.5 = 1 and 2 + 3 = 5. ' +
                'Next 1 * 5 = 5. Finally 5 / 2 = 2.5.'
            )
        ]
    },

    usability: {
        label: '4. Controls, errors and page checks',
        guide:
            'Check useful controls, mistake handling and basic page setup. ' +
            'Keyboard checks send test events. They do not test real Tab travel ' +
            'or screen-reader speech. These checks are not a full security ' +
            'or accessibility review.',
        tests: [
            check(
                'Enter calculates',
                'Type 1 + 2, then press Enter.',
                'One plus two is three. Enter should ask for the answer, ' +
                'just like the equals button.',
                function (c) {
                    keys(c, ['1', '+', '2', 'Enter']);
                    equal(display(c), '3');
                }
            ),
            check(
                'The equals key calculates',
                'Type 4 + 5, then press the = key.',
                'Four plus five is nine. The keyboard equals key should show 9.',
                function (c) {
                    keys(c, ['4', '+', '5', '=']);
                    equal(display(c), '9');
                }
            ),
            check(
                'Backspace removes only the last character',
                'Type 123, then press Backspace.',
                'Only the last digit, 3, should disappear. ' +
                'The display should still say 12.',
                function (c) {
                    keys(c, ['1', '2', '3', 'Backspace']);
                    equal(display(c), '12');
                }
            ),
            check(
                'Escape clears the display',
                'Enter 7 with a button, then press Escape.',
                'Escape gives us a fresh start. The old 7 should disappear.',
                function (c) {
                    enter(c, '7');
                    keys(c, ['Escape']);
                    equal(display(c), '');
                }
            ),
            check(
                'Both c and C clear the display',
                'Enter 7 before trying each of the c and C keys.',
                'The small c and capital C are both clear keys. ' +
                'Each should erase the 7.',
                function (c) {
                    ['c', 'C'].forEach(function (key) {
                        enter(c, '7');
                        keys(c, [key]);
                        equal(display(c), '');
                    });
                }
            ),
            check(
                'Keyboard parentheses and multiplication',
                'Type (1 + 2) * 3, then press Enter.',
                'First 1 + 2 = 3 inside the parentheses. Then 3 times 3 = 9. ' +
                'These keys must reach the calculator.',
                function (c) {
                    keys(c, ['(', '1', '+', '2', ')', '*', '3', 'Enter']);
                    equal(display(c), '9');
                }
            ),
            check(
                'Browser shortcuts are left alone',
                'Enter 7, then send Ctrl+C, Command+C and Alt+C.',
                'Holding a shortcut key changes the job of C. The calculator ' +
                'should keep 7 and leave the key event alone.',
                function (c) {
                    enter(c, '7');

                    ['ctrlKey', 'metaKey', 'altKey'].forEach(function (modifier) {
                        var options = {};
                        options[modifier] = true;

                        var event = keydown(c, 'c', c.doc, options);

                        equal(display(c), '7');
                        expect(
                            !event.defaultPrevented,
                            modifier + ' was blocked.'
                        );
                    });
                }
            ),
            check(
                'Typing in a text box leaves the calculator alone',
                'Add a temporary text box and send its 8 key event.',
                'A key sent from a text box belongs there. ' +
                'It should not add 8 to the calculator or be blocked.',
                function (c) {
                    checkEditing(c, 'input');
                }
            ),
            check(
                'Typing in an editable area leaves the calculator alone',
                'Add a temporary editable area and send its 8 key event.',
                'Writing in another area should not change our calculator answer. ' +
                'The event should remain available to that area.',
                function (c) {
                    checkEditing(c, 'div');
                }
            ),
            check(
                'Division by zero gives a useful error',
                'Enter 1 / 0 and press =.',
                'There is no number that makes 0 times that number equal 1. ' +
                'Show an error about zero and keep the sum so we can fix it.',
                function (c) {
                    rejectExpression(c, '1/0', /zero/i);
                }
            ),
            check(
                'A missing closing parenthesis is rejected',
                'Enter (2 + 3 without the closing parenthesis.',
                'An opening parenthesis needs a matching closing one. ' +
                'The calculator should ask us to fix the sum instead of guessing.',
                function (c) {
                    rejectExpression(c, '(2+3', /invalid|error|parenthes/i);
                }
            ),
            check(
                'Two decimal points in one number are rejected',
                'Enter 1..2 + 3 and press =.',
                'A number can have one decimal point. Two dots do not tell us ' +
                'one clear number, so this sum needs an error.',
                function (c) {
                    rejectExpression(c, '1..2+3', /invalid|error|decimal/i);
                }
            ),
            check(
                'A valid sum still works after an error',
                'Try 1 / 0, clear it, then calculate 2 + 3.',
                'One mistake should not break the calculator. ' +
                'After clearing it, two plus three should give 5.',
                function (c) {
                    rejectExpression(c, '1/0', /zero/i);
                    c.alerts.length = 0;

                    click(c, 'C');
                    enter(c, '2+3');
                    click(c, '=');

                    equal(display(c), '5');
                }
            ),
            check(
                'HTML-looking input stays plain text',
                'Send <b>7</b> through the input helper used by the buttons.',
                'These characters should stay text. They should not create ' +
                'a bold-text element inside the display. This is one small safety check.',
                function (c) {
                    expect(
                        typeof c.win.inputText === 'function',
                        'The input helper is missing.'
                    );

                    c.win.inputText('<b>7</b>');

                    equal(display(c), '<b>7</b>');
                    expect(
                        c.output.children.length === 0,
                        'The input created an HTML element.'
                    );
                }
            ),
            check(
                'Code-looking input is rejected without running',
                'Put a harmless test instruction in the display, then press =.',
                'A calculator should read sums, not follow computer instructions. ' +
                'Our private test marker must stay at 0 and an error must appear. ' +
                'This checks only this example.',
                function (c) {
                    var key = '__calculatorTestMarker';

                    // Preserve any previous property with this name.
                    var previous = Object.getOwnPropertyDescriptor(c.win, key);

                    expect(
                        !previous || previous.configurable,
                        'The test marker name is already locked.'
                    );

                    try {
                        Object.defineProperty(c.win, key, {
                            value: 0,
                            writable: true,
                            configurable: true
                        });

                        // Buttons cannot enter letters.
                        // This safety check deliberately inserts text directly.
                        c.output.textContent = '(window.__calculatorTestMarker=1)';
                        click(c, '=');

                        equal(c.win[key], 0);
                        equal(
                            display(c),
                            '(window.__calculatorTestMarker=1)'
                        );

                        expect(
                            c.alerts.some(function (text) {
                                return /invalid|error/i.test(text);
                            }),
                            'No useful error appeared.'
                        );

                        c.alerts.length = 0;
                    } finally {
                        // Do not leave our temporary marker behind.
                        if (previous) {
                            Object.defineProperty(c.win, key, previous);
                        } else {
                            delete c.win[key];
                        }
                    }
                }
            ),
            check(
                'Required buttons are enabled and in the tab order',
                'Check all number, operator, clear and equals buttons.',
                'A missing or disabled key cannot do its job. A negative tab index ' +
                'also skips that button during normal Tab travel. ' +
                'We check these settings, not the actual journey.',
                function (c) {
                    '0123456789+-*/().C='.split('').forEach(function (label) {
                        var button = findButton(c.doc, label);

                        expect(
                            button &&
                            !button.disabled &&
                            button.tabIndex >= 0 &&
                            button.getAttribute('aria-disabled') !== 'true',
                            'Unavailable button: ' + label
                        );
                    });
                }
            ),
            check(
                'Buttons have text names',
                'Check each required button for text or a linked name.',
                'A name tells us what a button does. For symbol buttons, ' +
                'we also look for a word such as Add or Clear. ' +
                'This checks the labels, not a screen reader itself.',
                function (c) {
                    '0123456789+-*/().C='.split('').forEach(function (label) {
                        var button = findButton(c.doc, label);
                        expect(button, 'Missing button: ' + label);

                        var name = textName(c.doc, button);

                        expect(
                            name &&
                            (/^\d$/.test(label) || /[a-z]{2,}/i.test(name)),
                            'Missing useful name for: ' + label
                        );
                    });
                }
            ),
            check(
                'The answer display has a name and update setting',
                'Check the actual answer display for its name, meaning and live-update setting.',
                'A name tells us where the answer is. An output or status element ' +
                'marks it as a result. A live setting asks reading software to announce ' +
                'changes; we do not test the spoken voice here.',
                function (c) {
                    var role = c.output.getAttribute('role');

                    expect(
                        c.output.tagName === 'OUTPUT' || role === 'status',
                        'The display is not marked as a result.'
                    );

                    expect(
                        textName(c.doc, c.output),
                        'The answer display has no text name.'
                    );

                    var live = c.output.getAttribute('aria-live');

                    expect(
                        live === 'polite' ||
                        live === 'assertive' ||
                        (!live && role === 'status'),
                        'The display has no supported live-update setting.'
                    );
                }
            ),
            check(
                'The browser tab identifies the calculator',
                'Read the calculator page title.',
                'A title is like a label on a folder. ' +
                'The word Calculator helps us find the right tab.',
                function (c) {
                    expect(
                        /calculator/i.test(c.doc.title),
                        'The page title does not identify the calculator.'
                    );
                }
            ),
            check(
                'The English page declares English',
                'Read the language setting on the calculator page.',
                'The page is written in English. Its language label helps ' +
                'reading software choose how to pronounce the words.',
                function (c) {
                    expect(
                        /^en(?:-|$)/i.test(c.doc.documentElement.lang),
                        'Expected an English language tag, such as en.'
                    );
                }
            ),
            check(
                'The mobile viewport uses the device width',
                'Read the mobile viewport setting and look for zoom restrictions.',
                'A phone needs a page width that matches its screen. ' +
                'People should also be allowed to zoom in. ' +
                'This setting alone does not prove the layout fits.',
                function (c) {
                    var meta = c.doc.querySelector('meta[name="viewport"]');
                    var content = meta ? meta.content : '';

                    expect(
                        /(?:^|[,;\s])width\s*=\s*device-width(?:$|[,;\s])/i.test(content),
                        'Missing width=device-width.'
                    );

                    expect(
                        !/user-scalable\s*=\s*(?:no|0)(?:$|[,;\s])/i.test(content),
                        'Zoom is disabled.'
                    );

                    expect(
                        !/maximum-scale\s*=/i.test(content),
                        'A maximum zoom limit is set.'
                    );
                }
            )
        ]
    }
};


// ------------------------------------------------------------
// 3. Shared helpers
// ------------------------------------------------------------

// Number the questions across all groups.
// Inserting a question earlier will change later question numbers.
var nextNumber = 1;

Object.values(groups).forEach(function (group) {
    group.tests.forEach(function (test) {
        test.number = nextNumber++;
    });
});

// An assertion describes what must be true.
//
// Throwing stops the current question.
// runCase catches that error and records a FAIL.
function expect(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// Exact comparison for text and settings.
// JSON.stringify makes an empty string visible as "".
function equal(actual, expected) {
    expect(
        actual === expected,
        'Expected ' + JSON.stringify(expected) +
        '; got ' + JSON.stringify(actual) + '.'
    );
}

// Build one element for the test report.
//
// Use textContent so HTML-looking test strings remain text.
// innerHTML could turn a test string into a real HTML element.
function node(tag, className, text) {
    var element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    // 0 and "" can be valid content, so check for undefined.
    if (text !== undefined) {
        element.textContent = text;
    }

    return element;
}

// Treat x, X, × and * as equivalent for comparison.
// This does not change the actual calculator display.
function normalize(text) {
    return text
        .replace(/[xX×]/g, '*')
        .replace(/\s/g, '');
}

// Find the actual calculator button.
//
// Clicking buttons checks their wiring as well as the math engine.
function findButton(doc, label) {
    return Array.from(doc.querySelectorAll('button')).find(
        function (button) {
            return normalize(button.textContent) === normalize(label);
        }
    );
}

// c is the calculator context:
// c.win    = calculator window
// c.doc    = calculator document
// c.output = calculator display
//
// These belong to the iframe, not to the report page.
function click(c, label) {
    var button = findButton(c.doc, label);

    expect(
        button && !button.disabled,
        'Missing or disabled button: ' + label
    );

    button.click();
}

function display(c) {
    return c.output.textContent.trim();
}

// Enter one character at a time, then verify the entered expression.
//
// A broken input button must not pass just because the final number
// happens to match the expected answer.
function enter(c, expression) {
    expression.split('').forEach(function (character) {
        click(c, character);
    });

    equal(normalize(display(c)), expression);
}

// Send a synthetic keyboard event.
//
// bubbles:
//     Lets an event from a field reach a document listener.
//
// cancelable:
//     Lets the listener call preventDefault().
//
// These events test JavaScript handling.
// They do not perform real typing, Tab movement or copy/paste.
function keydown(c, key, target, options) {
    var event = new c.win.KeyboardEvent(
        'keydown',
        Object.assign(
            {
                key: key,
                bubbles: true,
                cancelable: true
            },
            options
        )
    );

    (target || c.doc).dispatchEvent(event);

    // Return the event so tests can inspect defaultPrevented.
    return event;
}

function keys(c, sequence) {
    sequence.forEach(function (key) {
        keydown(c, key);
    });
}

// Create a temporary editing area.
// Its keyboard event must not change the calculator's existing 7.
//
// finally removes the field even if the check fails.
function checkEditing(c, tag) {
    enter(c, '7');

    var field = c.doc.createElement(tag);

    if (tag === 'div') {
        field.contentEditable = 'true';
    }

    c.doc.body.appendChild(field);

    try {
        var event = keydown(c, '8', field);

        equal(display(c), '7');

        expect(
            !event.defaultPrevented,
            'Typing in the other area was blocked.'
        );
    } finally {
        field.remove();
    }
}

// For invalid input, an error is the correct outcome.
//
// Check the current app's alert-based interface.
// The original expression should remain available for correction.
function rejectExpression(c, expression, messagePattern) {
    enter(c, expression);
    click(c, '=');

    equal(normalize(display(c)), expression);

    expect(
        c.alerts.some(function (text) {
            return messagePattern.test(text);
        }),
        'No useful error message appeared.'
    );

    // These alerts were expected and have been checked.
    // Later unexpected alerts must still fail the question.
    c.alerts.length = 0;
}

// Look for a label through linked elements, aria-label or text.
//
// This is a basic label check, not the browser's full
// accessible-name calculation.
function textName(doc, element) {
    var ids = element.getAttribute('aria-labelledby');

    if (ids) {
        return ids
            .trim()
            .split(/\s+/)
            .map(function (id) {
                var label = doc.getElementById(id);
                return label ? label.textContent.trim() : '';
            })
            .join(' ')
            .trim();
    }

    return (
        element.getAttribute('aria-label') ||
        element.textContent ||
        ''
    ).trim();
}

// Compare ordinary numeric answers.
//
// "0.3" and "3e-1" are different text but the same number.
//
// This function does not change the calculator's rounding rules.
// Precision-policy tests use their own exact display comparison.
function matchesAnswer(text, expected) {
    // Require a complete numeric string.
    // Reject empty text, partial numbers such as "3abc", and Infinity.
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
        return false;
    }

    var actual = Number(text);

    if (!Number.isFinite(actual)) {
        return false;
    }

    if (expected === 0) {
        return actual === 0;
    }

    // Ordinary math checks reject a changed sign or a lost non-zero value.
    if (actual === 0 || Math.sign(actual) !== Math.sign(expected)) {
        return false;
    }

    // A relative allowance shrinks with the expected answer.
    // A fixed large allowance could accidentally accept 0
    // instead of a tiny non-zero answer.
    return Math.abs(actual - expected) <= Math.abs(expected) * 1e-14;
}

// The test page can load before the iframe is ready.
//
// Promise:
//     Represents a result that will be available later.
//
// resolve:
//     The calculator is ready.
//
// reject:
//     Loading or access failed.
//
// The coordinator can await this without freezing the browser.
function waitForCalculator() {
    return new Promise(function (resolve, reject) {
        var timer;
        var timeout;
        var done = false;

        // Finish only once and stop both timers.
        function finish(error, context) {
            if (done) {
                return;
            }

            done = true;
            clearInterval(timer);
            clearTimeout(timeout);

            if (error) {
                reject(error);
            } else {
                resolve(context);
            }
        }

        function inspect() {
            try {
                var win = frame.contentWindow;
                var doc = frame.contentDocument;

                if (
                    win &&
                    doc &&
                    doc.readyState === 'complete' &&
                    doc.getElementById('input')
                ) {
                    finish(null, {
                        win: win,
                        doc: doc,
                        output: doc.getElementById('input')
                    });
                }
            } catch (error) {
                finish(
                    new Error(
                        'Cannot access calculator.html. ' +
                        'Open both pages on the same local web server.'
                    )
                );
            }
        }

        // Keep checking, but do not wait forever.
        timer = setInterval(inspect, 100);

        timeout = setTimeout(function () {
            finish(
                new Error('Calculator did not load within 8 seconds.')
            );
        }, 8000);

        // Check immediately too, in case it is already ready.
        inspect();
    });
}


// ------------------------------------------------------------
// 4. Run one question
// ------------------------------------------------------------

// An ordinary failure returns {pass: false, details: "..."}.
// It does not stop the other questions.
//
// This function checks behavior.
// renderResult handles the visible card.
function runCase(c, test) {
    var oldAlert = c.win.alert;

    // Preserve the display so one test does not leave its input behind.
    var savedDisplay = Array.from(c.output.childNodes).map(
        function (child) {
            return child.cloneNode(true);
        }
    );

    var errors = [];
    var result = {
        pass: false,
        details: ''
    };

    c.alerts = [];

    function onError(event) {
        errors.push(
            event.message || 'A calculator script error occurred.'
        );
    }

    // Capture alerts instead of opening blocking popups.
    c.win.alert = function (message) {
        c.alerts.push(String(message));
    };

    // Click and keyboard handlers may report errors outside our call stack.
    c.win.addEventListener('error', onError);

    try {
        // Start every question from an empty display.
        click(c, 'C');
        equal(display(c), '');

        if (test.run) {
            // Behavior checks supply their own procedure.
            test.run(c);
            result.details = 'The expected behavior was observed.';
        } else {
            // Math and precision-policy checks both use calculator buttons.
            enter(c, test.expr);
            click(c, '=');

            var actual = display(c);

            if (test.kind === 'precision-policy') {
                // Keep the true answer and chosen display rule visible.
                result.details =
                    'Exact answer: ' + test.exactAnswer +
                    ' | Expected display by design: ' + test.expectedDisplay +
                    ' | Displayed: ' + (actual || '(empty)');

                // This is a real check, not an unconditional PASS.
                expect(
                    actual === test.expectedDisplay,
                    result.details
                );
            } else {
                result.details =
                    'Expected: ' + test.expected +
                    ' | Displayed: ' + (actual || '(empty)');

                expect(
                    matchesAnswer(actual, test.expected),
                    result.details
                );
            }
        }

        // Expected alerts were checked and cleared by their questions.
        // Any remaining alerts are unexpected.
        expect(
            c.alerts.length === 0,
            'Unexpected alert: ' + c.alerts.join('; ')
        );

        expect(
            errors.length === 0,
            errors.join('; ')
        );

        // PASS is assigned only after all checks succeed.
        result.pass = true;
    } catch (error) {
        result.details = error.message;
    } finally {
        // Cleanup happens after both PASS and FAIL.
        c.win.alert = oldAlert;
        c.win.removeEventListener('error', onError);

        // Pass the saved nodes as separate replaceChildren arguments.
        c.output.replaceChildren.apply(c.output, savedDisplay);
    }

    return result;
}


// ------------------------------------------------------------
// 5. Show results and the selected group's guide
// ------------------------------------------------------------

// Keep the existing CSS classes so style2.css still styles the cards.
function renderResult(test, result, group, list) {
    var item = node('li', 'result-item');
    var top = node('div', 'result-top');
    var title = node('div');

    title.append(
        node(
            'p',
            'result-title',
            'Test #' + test.number + ': ' + test.name
        ),
        node(
            'p',
            'result-category',
            'Category: ' + group.label
        )
    );

    top.append(
        title,
        node(
            'span',
            'result-badge ' +
                (result.pass ? 'result-badge-pass' : 'result-badge-fail'),
            result.pass ? 'PASS' : 'FAIL'
        )
    );

    var explanation = node('details', 'result-explain');

    // Show failed explanations immediately.
    // Also keep the precision-policy explanation open when it passes,
    // so the intentional limitation remains visible.
    explanation.open =
        !result.pass || test.kind === 'precision-policy';

    explanation.append(
        node('summary', '', 'What should happen, and why?'),
        node('p', '', 'What we did: ' + test.what),
        node('p', '', 'Why: ' + test.why)
    );

    if (test.note) {
        explanation.append(
            node('p', '', 'Note: ' + test.note)
        );
    }

    item.append(
        top,
        node('p', 'result-details', result.details),
        explanation
    );

    list.appendChild(item);
}

// Preview the selected questions without running them.
// Derive the count from the array instead of maintaining a separate count.
function renderModeGuide() {
    var group = groups[modeSelect.value];

    document.getElementById('modeGuideTitle').textContent =
        'Selected now: ' + group.label +
        ' (' + group.tests.length + ' tests)';

    document.getElementById('modeGuideCopy').textContent =
        group.guide;

    var list = document.getElementById('modeGuideList');

    // Remove the old preview before showing the new group.
    list.replaceChildren();

    group.tests.forEach(function (test) {
        var answerText = '';

        if (test.kind === 'precision-policy') {
            // Do not present intentional rounding as an exact equation.
            answerText =
                ' -> expected display: ' + test.expectedDisplay +
                ' (intentional rounding)';
        } else if (test.expr) {
            answerText = ' = ' + test.expected;
        }

        list.appendChild(
            node(
                'li',
                '',
                '#' + test.number + ': ' + test.name + answerText
            )
        );
    });
}


// ------------------------------------------------------------
// 6. Coordinate the selected group
// ------------------------------------------------------------

// This was previously called runAllTests.
//
// runSelectedGroup is more accurate:
// it runs ONLY the group selected in the dropdown.
//
// async allows await.
// await pauses this function while it waits,
// without freezing the entire browser.
async function runSelectedGroup() {
    // Prevent two runs from changing the same calculator.
    if (running) {
        return;
    }

    running = true;
    runBtn.disabled = true;
    modeSelect.disabled = true;

    var group = groups[modeSelect.value];
    var number = ++runCounter;
    var started = Date.now();

    // Give this run its own report.
    var report = node('details', 'run-report');
    report.open = true;

    var heading = node(
        'summary',
        '',
        'Run #' + number + ' • ' + group.label + ' • running...'
    );

    var meta = node(
        'p',
        'run-report-meta',
        'Started: ' + new Date().toLocaleTimeString()
    );

    var list = node('ol', 'result-list');
    report.append(heading, meta, list);

    // Newest report first; previous reports remain underneath.
    document.getElementById('reportsHistory').prepend(report);

    var status = document.getElementById('status');
    var summary = document.getElementById('summary');
    var category = document.getElementById('categorySummary');

    status.textContent = 'Loading calculator.html...';
    summary.textContent = '—';
    category.textContent = group.label;

    var passed = 0;
    var completed = 0;

    // Make the meaning of this group's results explicit.
    var policyCount = group.tests.filter(function (test) {
        return test.kind === 'precision-policy';
    }).length;

    if (policyCount > 0) {
        meta.textContent +=
            ' | Includes ' + policyCount +
            ' intentional precision-policy check.';
    }

    try {
        // Wait before touching the iframe's controls.
        var context = await waitForCalculator();

        // Run one question at a time.
        // Parallel questions could erase each other's input.
        for (var test of group.tests) {
            var result = runCase(context, test);

            renderResult(test, result, group, list);

            completed++;

            if (result.pass) {
                passed++;
            }

            status.textContent =
                'Checked ' + completed +
                ' of ' + group.tests.length + '.';

            // Let the browser paint each new result.
            // The delay is for readable progress, not for the arithmetic.
            await new Promise(function (resolve) {
                setTimeout(resolve, 80);
            });
        }

        // Every completed question is either PASS or FAIL.
        summary.textContent =
            passed + ' PASS • ' + (completed - passed) + ' FAIL';

        category.textContent =
            group.label + ': ' + passed + '/' + completed + ' passed';

        heading.textContent =
            'Run #' + number + ' • ' +
            group.label + ' • ' + summary.textContent;

        meta.textContent +=
            ' | Finished in ' +
            ((Date.now() - started) / 1000).toFixed(1) + 's';

        status.textContent =
            "Finished. Open any note for that test's explanation.";
    } catch (error) {
        // A loading or runner problem is different from one wrong answer.
        // Ordinary question failures are already handled inside runCase.
        summary.textContent = 'NOT COMPLETED';

        heading.textContent =
            'Run #' + number + ' • ' +
            group.label + ' • could not finish';

        category.textContent =
            completed + '/' + group.tests.length + ' tests completed.';

        status.textContent =
            error.message +
            ' Keep calculator.html, app.js and the test files ' +
            'in the same folder and use a local web server.';
    } finally {
        // Always allow another attempt, including after loading fails.
        running = false;
        runBtn.disabled = false;
        modeSelect.disabled = false;
    }
}


// ------------------------------------------------------------
// 7. Connect the page controls
// ------------------------------------------------------------

// Pass the function itself, without ().
// The browser will call it when the event happens.
//
// Writing runSelectedGroup() here would execute it immediately.
modeSelect.addEventListener('change', renderModeGuide);
runBtn.addEventListener('click', runSelectedGroup);

// This immediate call is intentional:
// show the first group's guide when the page opens.
renderModeGuide();