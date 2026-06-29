# Renue Systems Website Rebuild

Static rebuild of the Renue Systems website using the upgraded modern visual language from the homepage.

## Directory Structure

```text
public/
  index.html                  # production homepage
  <clean-url>/index.html       # production pages
  assets/
    css/styles.css
    js/script.js
    images/

templates/
  *.html                       # older prototype templates kept for reference

source/
  official-current-website/    # SingleFile exports from the existing website

docs/
  NEW-PROJECT-PROMPT.md        # reusable rebuild workflow prompt
```

## Local Preview

Serve the `public/` directory as the site root.

```bash
npm run dev
```

## Deployment

For Vercel, use `public` as the output directory.
