# msc_cyber

Each page is created from a tsx file in `src/js/pages`.
Use `render()` from `js/utils.tsx` to render pages.
`js/injex.tsx` will be run before every page load script in project.
All data for pages will be stored in **ONE** html file. This is for publishing to the stemi platform.

---

Run `./publish.js --help` for publish output options.
Base sizes for publish in `./base_sizes.json`.
`./fix.html` and `./base_sizes` are required for publish

---

Run locally with `yarn webpack serve`
