# Frontend Calculator

## Features

- Addition, subtraction, multiplication and division with decimals and signed numbers.
- Standard operation order and nested parentheses.
- Mouse and keyboard controls: Enter or `=`, Backspace, Escape and C.
- Error messages for invalid expressions and division by zero; a manual test checklist.

## Intentional precision limits

For a simple display, results less than **0.000000000001 (`1e-12`)** from the nearest whole number are intentionally shown as that whole number. For example, `0.00000000000001` becomes `0`.

Results are also rounded to at most **15 significant digits**, not 15 decimal places. These rules are defined in [docs/app.js](docs/app.js):

- `normalizeFloatingError()`: `Math.abs(value - nearestInt) < 1e-12`.
- `formatResult()`: `Number(normalized.toPrecision(15)).toString()`.

**If these small differences matter, do not use this calculator. Use a tool designed for higher precision.** Scientific-notation input and mathematical functions are not supported.

## Run on your own computer (for your own modification)

1. Clone this repository.
2. Open a terminal in the project root.
3. Run:

```bash
cd docs
python3 -m http.server 8080
```

4. Open in your browser:

- http://localhost:8080/

5. Edit files, refresh the browser, and test your own changes.

---
---


## A short story about this project

This project started as my personal frontend practice, long before I used AI tools.

<p align="center">
  <img src="images/old.png"
       width="200"
       height="164"
       alt="old_look">
</p>

The old version in `old_version/HtmlPage1.html` was built with hard work and many trial-and-error attempts. It had a lot of mistakes, but it was my honest best effort. For detail: [Old_Version_Review](old_version/Old_Version_Review.md)

Now I look back, improve it, and try to give back by sharing a better version publicly for everyone who wants to use it or learn from it.

<p align="center">
  <img src="images/new.png"
       width="200"
       height="159"
       alt="new_look">
</p>

Live site:
https://noa-jou.github.io/Frontend-Calculator/


## Why the new version is in docs

I put the new version files in the [docs](docs) folder for GitHub Pages publishing.

GitHub Pages can publish from a selected folder, and this repository is configured so files inside [docs](docs) are served on the live site.Reference:
https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

Because of this setup, the [live site](https://noa-jou.github.io/Frontend-Calculator/) are as I mentioned before.


## What this new version offers

- Still built with basic HTML, CSS, and JavaScript (no framework)
- Keyboard support (Enter, Backspace, Escape, C)
- Parentheses support, including nested parentheses and unary +/- handling
- Multiplication input flexibility: `x`, `X`, and `*` are treated the same
- Better input validation and clearer error handling for invalid expressions
- Safer behavior for edge cases like divide-by-zero and malformed input
- Cleaner display formatting for common floating-point noise (example: `0.30000000000000004` -> `0.3`)
- A visual test dashboard with step-by-step categories (availability, math, accessibility, security, and fuzz/invariant checks)


## Why I share this

I hope this project helps all learners like me understand how to handle calculations correctly on the frontend using only core web frontend technologies.

I improved this version with help from ChatGPT and GitHub Copilot, and I am grateful for that support.

If this project is useful to you, I will be very happy.



## Support me by

[Buy me a coffee](https://buymeacoffee.com/noajou)
