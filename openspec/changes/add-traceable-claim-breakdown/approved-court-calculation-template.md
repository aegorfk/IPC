# Approved court-calculation template contract

## Reference

- Retained document: `/Users/aegorfk/Desktop/Расчеты.docx`
- SHA-256: `f59e6c85ea0c482fe44e159a21e1b3d22f0429008e9adafd7005b69a4d98b298`
- Rendered page count: 82
- Sections: 1
- Tables: 72
- Internal render evidence: `/Users/aegorfk/Documents/IPC/.tmp/approved-court-calculation-reference/render`
- The retained reference is read-only and remains the design authority.
- Canonical approved Google Doc: `1qwMjRD99FNWnF2Wu8T7wbkSuvDOiH5tu82aSxovxArE`; every generated version copies this document directly.

## Page and style system

- Portrait pages with the existing reference margins, footer, and right-aligned page numbering preserved by copying the approved Google Doc rather than creating a blank document.
- `Heading 1`: blue, bold, used only for `Расчет заявленных сумм`.
- `Heading 2`: blue, bold, used for numbered calculation sections and `Сводка`.
- `Heading 3`: blue, bold, used for key-rate and Article 236 subcalculations.
- Body text is black with the reference paragraph rhythm.
- Tables use black grid borders, light-gray header fill, bold headers, Russian monetary formatting with two decimals, and a bold/light-gray final total row.
- Summary table column widths are `105 / 70 / 95 / 90 / 80` points.
- Repeated five-column basis tables use `85 / 85 / 75 / 85 / 110` points.
- Two-column calculation tables use `290 / 150` points; key-rate tables use `210 / 60 / 70 / 100` points.

## Required content flow

1. `Расчет заявленных сумм`.
2. Calculation end-date metadata by selected basis.
3. `Сводка`: five columns in this order: requirement type, delay/period count, principal amount, Article 236 compensation, indexation.
4. Basis-specific period tables in the approved order when selected facts exist:
   - `1. Оклад: индексация, индексация недоплаты, матответственность`;
   - `2.1. Ежемесячные премии`;
   - `2.2. Ежеквартальные премии`;
   - `2.3. Ежегодные премии`;
   - `3. Отпуска`;
   - `4. Окончательный расчет при увольнении: перерасчет, индексация недоплаты и матответственность`.
5. `5. Расчет среднего заработка`, showing the selected scenario as authoritative and the other scenario only as comparison.
6. `6. Расчет сумм вынужденного прогула и матответственности` when that claim is selected.
7. `7. Подробный расчет матответственности по ст. 236 ТК РФ`, limited to selected Article 236 items and their available calculation detail.

## Repeated table contracts

- Basis period table columns: `Период`, `Недоплата, ₽`, `Индексация, ₽`, `236 ТК РФ, ₽`, `Итого, ₽`.
- Each period row combines only selected components for that basis and period; an unchecked component contributes zero and is not pleaded.
- The last row is `Итого`; every numeric cell equals the sum of the visible selected period rows above it.
- Article 236 rate-detail table columns are `Период`, `Ставка, %`, `Дней`, `Компенсация, ₽` when rate intervals are available in the selected payload.
- Until rate intervals are carried by the selected payload, the approved compact fallback is `Период`, `Суть нарушения`, `Компенсация, ₽`; rates or day counts must not be fabricated.
- Final selected total equals the sum of all checked stable-key amounts and is validated before the document is registered.

## Stable edit slots and preservation rules

- Values, period rows, selected section presence, warning notes, and explanatory formulas are dynamic.
- Section names/order, heading levels, table column order, visual styling, footer/page numbering, borders, and number formats are preserve-only unless the user explicitly approves a revised mockup/specification.
- The canonical source Google Doc and retained DOCX are never cleared or modified. A new copy of the canonical source is created for every run; only that new copy may be rebuilt, and a previous generated report must never become the next template implicitly.
- Unselected facts remain available in Sheets but must not appear in the selected judicial calculation or contribute to its totals.
