# Enterijeri RC10 — sajt

Statički sajt (HTML + CSS + JS, bez biblioteka). Radi na GitHub Pages / bilo kom hostingu.

## Struktura
- `index.html` — stranica
- `css/style.css` — svi stilovi (boje u `:root`)
- `js/main.js` — preloader, animacije, usluge pri skrolu, proces, pre/posle, forma
- `assets/logo.jpg` — logo
- `assets/images/` — fotografije (spisak naziva u `assets/images/README.txt`)

## Aktivacija forme
U `js/main.js` upišite endpoint u `FORM_ENDPOINT` (npr. Formspree: `https://formspree.io/f/xxxxxxx`).

## GitHub Pages
Postavite sadržaj ovog foldera u koren repozitorijuma → Settings → Pages → Deploy from branch (main / root).
