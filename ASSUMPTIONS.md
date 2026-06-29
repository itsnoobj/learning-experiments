# Assumptions & Decisions Made Overnight

> Review in the morning. Flag anything you disagree with.

---

## Assumptions

1. **Game assets are original SVGs** — I'm creating our own pixel-art-style SVG tiles (ground, pipes, blocks, clouds) rather than ripping from Nintendo. They look platformer-ish but are legally ours.

2. **Chapter 31 is the only content for now** — All pages route to chapter 31 data. Multi-chapter routing is stubbed but not wired to real data yet.

3. **Audio/visual paths** — Moving the chapter MP3 and SVG into `apps/web/public/content/` so Next.js can serve them. The source-of-truth remains in `/content/chapters/` but public assets are copied there.

4. **Theme defaults to dark** — Since the game and map are both dark, and the overall vibe is minimal/dark, I'm making dark the default. Light mode still works via toggle.

5. **Game doesn't use sprites from the reference repos** — Those are copyrighted Nintendo assets. Our game uses original SVG-based tiles + our stick figure. The gameplay mechanics (auto-runner, jump, collision) are inspired by the reference repos.

6. **Mobile map: horizontal scroll** — Rather than shrinking the SVG (making labels unreadable), on mobile the map scrolls horizontally with a hint/arrow. Nodes stay readable at all sizes.

7. **Quiz "wrong answer" stays visible** — Removed the auto-erase-after-1.5s behavior. Wrong answer feedback stays until you try again. Better for learning.

8. **Progress is persisted to localStorage** — No backend sync yet. `progressStore` saves to localStorage via Zustand persist middleware. Clearing browser data resets progress.

9. **Game resume flow** — After completing a quiz from the game, navigating back to `/game?resume=1` restores score and picks the next obstacle chapter. Game speed resets to base (grace period).

10. **No authentication** — Everything works without login. Future feature.

---

## Decisions Made

- Fixed all 5 P0 issues from the UX review
- Added ThemeToggle button (top-right corner, all pages)
- Wired progressStore.completeChapter() into the result page flow
- Game now draws ground tiles, pipes, blocks, and clouds using the SVG assets
- Map uses responsive container with min-width and horizontal scroll on mobile
- Audio player has proper 44px tap target
- Gold button text changed to dark (#1A1A1A) for WCAG AA contrast

---

## Still TODO (for you to prioritize)

- [ ] Write more chapters (pick 3-5 from OUTLINE.md)
- [ ] Polish game feel (sprite animations, particle effects, sound)
- [ ] Real Mario-style world map (more organic path layout, maybe multiple worlds)
- [ ] Multiple quiz templates per chapter (currently 1 chapter has all 3)
- [ ] Deploy somewhere to share/test on phone
- [ ] Instagram swipe card generator from chapter JSON
- [ ] Content CMS or admin panel for adding chapters without code

---

## Questions for You

1. **Domain name?** Do you have one in mind, or should I use a placeholder?
2. **The game character** — stick figure is our brand, but should it have more personality? A hat? A backpack? Or keep it pure minimal?
3. **Sound effects** — should the game have jump/hit sounds? Or keep it silent (audio only for story playback)?
4. **Chapter order in game** — currently random-ish (cycles through 5). Should it follow the outline order, or stay random for discovery?
