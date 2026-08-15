## Homepage Redesign QA

**Source visual truth**
- Original: `/Users/apple/.codex/generated_images/019edfae-9056-78f1-82af-43c2341deb1d/exec-984d9a5d-c5a3-47c9-a557-ab0234e05752.png`
- Local implementation: `http://localhost:3017/`
- Desktop capture: `/Users/apple/Documents/huichengjin/tmp/home-corrected-1440.png`
- Full-view comparison: `/Users/apple/Documents/huichengjin/tmp/home-reference-vs-implementation.png`
- Lower-page desktop capture: `/Users/apple/Documents/huichengjin/tmp/home-corrected-footer-1440.png`
- Mobile capture: `/Users/apple/Documents/huichengjin/tmp/home-corrected-mobile-top.png`
- Responsive repair captures: `/Users/apple/Documents/huichengjin/tmp/home-mobile-after-top.png`, `/Users/apple/Documents/huichengjin/tmp/home-tablet-after-top.png`, `/Users/apple/Documents/huichengjin/tmp/home-desktop-after-top.png`, `/Users/apple/Documents/huichengjin/tmp/home-mobile-after-process.png`, and `/Users/apple/Documents/huichengjin/tmp/home-mobile-after-industries.png`

**Comparison setup**
- Source crop: 862 x 604 px, paired beside the same top-of-page state from the implementation for side-by-side review.
- Implementation: 1440 x 1024 CSS px at device scale factor 1.
- Mobile verification: 390 x 844 CSS px at device scale factor 1.
- Responsive repair verification: 320 x 740, 390 x 844, 768 x 1024 and 1440 x 1000 CSS px at device scale factor 1.
- State: homepage at the top of the page, Rod selected in the drawing selector.

**Findings**
- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the implementation uses the existing Geist system font with the source's heavy navy display hierarchy, compact navigation, all-caps eyebrow, and restrained small utility copy. Line breaks and heading density match the target composition.
- Spacing and layout rhythm: desktop header, category rail, 50/50 hero split, image crop, selector width, product-row rhythm, dark process section, industry grid, and footer were reviewed. Homepage content uses a reference-matched 88% canvas; this avoids the former ultra-wide-screen collapse.
- Colors and visual tokens: white, deep navy, steel gray, and industrial blue maintain the source's contrast and quiet technical palette. Selection, action, and hover states use the same blue family.
- Image quality and asset fidelity: the logo crop, rod hero crop, and process-line crop are taken directly from the selected source image. Measured source icon assets now appear in the category rail, drawing selector, product rows, industry cards, and service row. They use `object-cover` or `object-contain` without stretching.
- Copy and interaction: sample-style homepage copy is retained. Product mode selection changes the active state and the contact URL parameter; the primary and secondary drawing actions remain real links.
- Responsive and accessibility: at 390 px the header switches to its menu control, the hero stacks cleanly, horizontal overflow is false, and no text or action control is clipped. The mobile menu exposes all homepage routes.

**Comparison history**
1. [P1 fixed] A homepage-only dark utility bar and the global floating inquiry card were visible even though neither appears in the source. The utility bar and floating card are now suppressed only on `/`; other routes retain their existing contact behavior. Evidence: final desktop capture.
2. [P2 fixed] The homepage navigation did not follow the source's visual rhythm and produced a duplicate React key warning. Homepage navigation now uses `Products / Capabilities / Why Xijiu / Industries / Resources / About / Contact` with unique keys and real route targets. Evidence: final desktop capture and browser DOM verification.
3. [P2 fixed] The footer brand treatment inverted the entire raster lockup into an unreadable white block. The source lockup is now shown in its original, legible form on a white logo plate in the newly added dark footer. Evidence: `/Users/apple/Documents/huichengjin/tmp/home-footer-final.png`.
4. [P1 fixed] On ultra-wide screens, hero copy used `calc((100vw - 1280px)/2)` as its horizontal padding. This pushed the right column toward the center and made its content appear as a narrow strip. Hero columns are now a stable 50/50 grid with bounded `clamp()` padding; homepage sections use a dedicated 88% canvas. Evidence: desktop DOM measurement at 1440 px reports `720px 720px` hero columns and a `1267px` canvas.
5. [P2 fixed] Generic line icons did not match the selected visual reference. The top rail, selector, product rows, industries, and service row now use the measured, reference-matched icon assets. Evidence: browser DOM inspected 29 loaded homepage icon images.
6. [P1 fixed] The 768 px layout stacked the hero image above the copy block, creating a 971 px-tall first section; mobile product rows also became single-column content stacks. The hero now keeps the reference's 50/50 composition from 768 px upward, while mobile has a 270 px image band and product rows keep their icon, copy and specifications in a two-column grid. Evidence: browser measurements record a 384 px / 384 px tablet hero grid with a 629 px hero, and a 48 px / 298 px mobile product row with no page overflow.
7. [P2 fixed] Process metrics and industry cards were vertically sparse on phones. Their mobile layouts now use two equal columns while retaining the desktop six-card and five-metric compositions. Evidence: 390 px browser inspection reports six industry cards at 173 px x 210 px and no horizontal document overflow.

**Focused region comparison**
- The hero/header comparison was required because it contains the logo crop, navigation density, 50/50 image/text split, selector state, and CTA treatment. It is documented in the combined side-by-side image above.
- The process and footer areas were reviewed separately because they are below the fold and absent from the selected source. They intentionally extend the sample's visual system with an existing-site-compatible footer and real website links.

**Verification**
- `pnpm lint`: passed.
- `pnpm build`: passed.
- Browser console: no blocking errors after the navigation-key fix.
- Product selector: selecting Tube produces `aria-pressed="true"` and `/contact?interest=tube`.
- Desktop at 1440 x 1000: 50/50 hero = `720px / 720px`; hero copy padding = `40px 72px`; selector = `368px x 189px`.
- Mobile at 390 x 844: one-column hero, `scrollWidth - viewportWidth = 0`, and 23 reference icon assets loaded in the visible route.
- Narrow mobile at 320 x 740: `scrollWidth - viewportWidth = 0`; header, selector and product rail remain within the viewport.
- Tablet at 768 x 1024: hero grid = `384px / 384px`, hero height = `629px`, and document overflow = `0`.
- Desktop at 1440 x 1000: hero grid = `720px / 720px`, hero height = `539px`, and document overflow = `0`.
- Mobile menu opens all homepage routes without overflow. Selecting Tube updates the drawing action to `/contact?interest=tube` and sets `aria-pressed="true"`.
- Desktop, mobile, process section, footer, and mobile navigation were browser-checked.

**Follow-up Polish**
- No P3 changes are necessary before deployment. The new footer is intentional because the selected source did not include one.

final result: passed
