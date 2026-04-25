# Hover Word Rules

On the student platform, certain English words display an isiZulu translation when the student taps or hovers over them. This is the primary bilingual feature of the platform.

The agent marks these words in its output using a standard tag so the platform can render them correctly.

---

## Which words get a hover translation

A word gets a hover translation if it meets one or more of these criteria:

1. **Business or technical term** — a word that has a specific meaning in a business context that may differ from its everyday meaning
   - Examples: invoice, budget, profit, revenue, interest, account, capital, stock, receipt, deposit
   
2. **Formal English word** — a word that is correct English but unlikely to be in a Grade 8 isiZulu-speaking student's active vocabulary
   - Examples: formal, professional, registered, application, confirmation, transaction, opportunity
   
3. **Digital/app term** — a word that refers to a specific part of an app or interface
   - Examples: subject line, attachment, profile, setting, notification, download, browser, dashboard

---

## Words that do NOT get a hover translation

- Simple words the student encounters in daily life (food, school, money, phone, family)
- Words already defined in the same sentence or paragraph
- Names of apps, companies, or people (Gmail, WhatsApp, Canva, SEDA)

---

## How the agent marks hover words

In the agent's output, mark a hover word using this HTML-compatible format:

```html
<span class="hover-word" data-zu="[isiZulu translation]">[English word]</span>
```

Example:
```html
A <span class="hover-word" data-zu="i-invoice">receipt</span> is a written record of what a customer paid.
```

On the platform, this span renders with a dotted underline. On tap/hover, the isiZulu translation appears in a small tooltip above the word.

---

## Core glossary (required hover words)

These words must always be marked as hover words when they appear:

| English | isiZulu | Notes |
|---|---|---|
| invoice | i-invoice / isikweletu | Use i-invoice as more recognisable |
| budget | isabelomali | Budget allocation |
| profit | inzuzo | What is left after costs |
| revenue | imali engenayo | Money coming in |
| customer | umthengi | Person who pays |
| account | i-akhawunti | Bank or app account |
| capital | inhlalo yezimali | Starting money |
| receipt | irisidi | Proof of payment |
| deposit | idiphozithi | Money put into an account |
| interest | inzalo | Cost of borrowing money |
| registered | ubhalisile | Official business status |
| application | isicelo | Form you fill in |
| transaction | ukushintshaniswa kwemali | Exchange of money |
| stock | izimpahla | Items available to sell |
| professional | umuntu oyingcweti | Skilled, formal |

---

## isiZulu quality gate

The teacher QAs all isiZulu translations before publishing. When a teacher reviews a generated lesson, they see the hover words highlighted and can edit the isiZulu translation directly. This is the most important teacher edit — the agent's isiZulu should be treated as a first draft, not final.
