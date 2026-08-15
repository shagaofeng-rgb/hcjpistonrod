# Homepage Template Ratios

Source reference: `exec-984d9a5d-c5a3-47c9-a557-ab0234e05752.png` (862 x 1824 px).
The homepage implementation uses these measurements as desktop layout rules. Values marked with `~` are visual proportions measured from the selected reference.

| Area | Reference measurement | Implemented desktop rule |
| --- | --- | --- |
| Primary header | 68 px / 3.7% page height | 68 px visual band; contained navigation |
| Product rail | 45 px / 2.5% page height | 44 px minimum; five equal navigation items |
| Hero | 491 px / 26.9% page height | `min-height: 492px` from 1024 px upward |
| Hero image / copy | 444 px : 418 px / 51.5% : 48.5% | Stable 1 : 1 two-column grid, image at 50%, copy at 50% |
| Hero copy inset | ~42 px from split / 9.7% of reference width | `clamp(40px, 5vw, 96px)`; never calculated from unused screen width |
| Drawing selector | ~335 x 169 px | max width 368 px, three equal cells, 108 px minimum cell height |
| Product section | ~447 px / 24.5% page height | five consistent rows inside one uninterrupted grid |
| Main content width | ~760 px / 88.2% page width | shared constrained container with fixed side gutters |
| Production section | ~393 px / 21.5% page height | full-width dark band with six equal process columns and five equal metrics |
| Industries | six equal cards | six desktop columns; no nested cards or arbitrary icons |
| Service row | four equal items | four desktop columns using source-matched line icons |
| Footer | not present in source | full-width industrial footer retained as an explicit requested addition |

## Responsive Contract

- Tablet and desktop preserve the two equal hero columns from 768 px upward; the tablet copy scale and selector spacing compress without changing the image/copy relationship.
- Wide displays do not increase hero horizontal padding beyond 96 px; this prevents the copy column from collapsing on 2K and 4K screens.
- Below 768 px the hero becomes a readable vertical flow with a shorter image band, while all image assets retain their aspect ratio and are never stretched.
- The product rail remains horizontally scrollable on small screens rather than compressing labels or icons.
- Product rows use a two-column mobile grid so the icon, title, description and specification remain one readable unit; industry and process sections use compact two-column mobile grids.
