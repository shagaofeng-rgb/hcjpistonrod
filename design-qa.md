## Homepage Redesign QA

**Source visual truth**
- Original: `/Users/apple/.codex/generated_images/019edfae-9056-78f1-82af-43c2341deb1d/exec-984d9a5d-c5a3-47c9-a557-ab0234e05752.png`
- Normalized source region: `/Users/apple/Documents/huichengjin/tmp/reference-top-crop.png`
- Local implementation: `http://localhost:3016/`
- Desktop capture: `/Users/apple/Documents/huichengjin/tmp/home-final-production-desktop.png`
- Full-view comparison: `/Users/apple/Documents/huichengjin/tmp/home-reference-implementation-comparison.png`
- Mobile capture: `/Users/apple/Documents/huichengjin/tmp/home-final-production-mobile.png`

**Comparison setup**
- Source crop: 862 x 612 px, normalized to 1440 x 1024 px for side-by-side review.
- Implementation: 1440 x 1024 CSS px at device scale factor 1.
- Mobile verification: 390 x 844 CSS px at device scale factor 1.
- State: homepage at the top of the page, Rod selected in the drawing selector.

**Findings**
- No actionable P0, P1, or P2 findings remain.
- Fonts and typography: the implementation uses the existing Geist system font with the source's heavy navy display hierarchy, compact navigation, all-caps eyebrow, and restrained small utility copy. Line breaks and heading density match the target composition.
- Spacing and layout rhythm: desktop header, category rail, 50/50 hero split, image crop, selector width, product-row rhythm, dark process section, industry grid, and footer were reviewed. The homepage-specific utility strip was removed to match the source header height.
- Colors and visual tokens: white, deep navy, steel gray, and industrial blue maintain the source's contrast and quiet technical palette. Selection, action, and hover states use the same blue family.
- Image quality and asset fidelity: the logo crop, rod hero crop, and process-line crop are taken directly from the selected source image. They use `object-cover` at measured areas without stretching. Library icons are used for functional controls and responsive states.
- Copy and interaction: sample-style homepage copy is retained. Product mode selection changes the active state and the contact URL parameter; the primary and secondary drawing actions remain real links.
- Responsive and accessibility: at 390 px the header switches to its menu control, the hero stacks cleanly, horizontal overflow is false, and no text or action control is clipped. The mobile menu exposes all homepage routes.

**Comparison history**
1. [P1 fixed] A homepage-only dark utility bar and the global floating inquiry card were visible even though neither appears in the source. The utility bar and floating card are now suppressed only on `/`; other routes retain their existing contact behavior. Evidence: final desktop capture.
2. [P2 fixed] The homepage navigation did not follow the source's visual rhythm and produced a duplicate React key warning. Homepage navigation now uses `Products / Capabilities / Why Xijiu / Industries / Resources / About / Contact` with unique keys and real route targets. Evidence: final desktop capture and browser DOM verification.
3. [P2 fixed] The footer brand treatment inverted the entire raster lockup into an unreadable white block. The source lockup is now shown in its original, legible form on a white logo plate in the newly added dark footer. Evidence: `/Users/apple/Documents/huichengjin/tmp/home-footer-final.png`.

**Focused region comparison**
- The hero/header comparison was required because it contains the logo crop, navigation density, 50/50 image/text split, selector state, and CTA treatment. It is documented in the combined side-by-side image above.
- The process and footer areas were reviewed separately because they are below the fold and absent from the selected source. They intentionally extend the sample's visual system with an existing-site-compatible footer and real website links.

**Verification**
- `pnpm lint`: passed.
- `pnpm build`: passed.
- Browser console: no blocking errors after the navigation-key fix.
- Product selector: selecting Tube produces `aria-pressed="true"` and `/contact?interest=tube`.
- Desktop, mobile, process section, footer, and mobile navigation were browser-checked.

**Follow-up Polish**
- No P3 changes are necessary before user review. The new footer is intentional because the selected source did not include one.

final result: passed
