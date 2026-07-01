# Renue Systems Website

Static rebuild of the Renue Systems website with a modernized visual language,
client-side EN / FR / ES internationalization, an interactive office-locator
map, and clean-URL routing.

## Directory Structure

```text
public/                         # site root (served as-is)
  index.html                    # homepage
  <slug>/index.html             # one clean-URL directory per page
                                  about/, contact-us/, franchise-opportunities/,
                                  hotel-services/, commercial-services/,
                                  photos/, videos/, carpet-cleaning/,
                                  marble-natural-stone-restoration/,
                                  commercial-kitchen-cleaning-services/,
                                  tile-grout-restoration/,
                                  vinyl-tile-restoration-services/,
                                  hospitality-exterior-power-washing/,
                                  hospitality-room-treatment-solutions/,
                                  advanced-odor-removal-services/,
                                  advanced-electrostatic-disinfection/,
                                  flood-clean-up-services/,
                                  escalator-cleaning-services/,
                                  light-fixture-cleaning-services/,
                                  professional-chandelier-cleaning-services/,
                                  ptac-vtac-cleaning-services/,
                                  trash-laundry-chute-cleaning/,
                                  mattress-tv-appliance-recycling-replacement/,
                                  otel-hygiene-upholstery-cleaning/,
                                  step-2/, step-3/
  assets/
    css/styles.css              # all site styles (incl. scroll-reveal)
    js/
      script.js                # nav, reveal observer, map, forms, carousels
      i18n.js                  # client-side i18n engine (EN/FR/ES)
      translations.js          # FR + ES dictionaries (RENUE_I18N_DICT / _ES)
      services-data.js         # shared service/marketplace data
    images/                    # page + office photos, Wix assets, flags
    videos/                    # franchise / gallery video assets
    vendor/                    # leaflet.js + leaflet.css (office map), vendor imgs

scripts/                       # one-off build / localization helpers
  localize-assets.mjs          # downloads + localizes Wix assets into public/
  rewrite-refs.mjs             # rewrites asset refs across the pages
  url-map.json                 # gitignored — generated URL→asset map

vercel.json                    # outputDirectory: public, cleanUrls: true
package.json                   # `npm run dev` / `npm run preview` → npx serve public
.gitignore                     # node_modules/, env, scripts/url-map.json, scratch
```

## Local Preview

Serve `public/` as the site root so clean URLs (`/contact-us/`) resolve:

```bash
npm run dev      # npx serve public
```

## Internationalization

Each page is authored in English. On load, `assets/js/i18n.js` reads the saved
language from `localStorage` (default `en`) and swaps text nodes and
translatable attributes (`placeholder`, `alt`, `aria-label`, `title`,
`content`) using the dictionaries in `assets/js/translations.js` (`fr`, `es`).
English is the source language; add a language by registering a dict in
`i18n.js#DICTS` and `setLang()`, then adding entries in `translations.js`.

## Deployment

For Vercel, `public` is the output directory (`vercel.json`). Clean URLs are
enabled there too, so a directory like `public/contact-us/index.html` is served
at `/contact-us`.
