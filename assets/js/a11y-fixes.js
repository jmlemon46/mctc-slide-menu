// MCTC accessibility fixes for markup made by Divi and other plugins, which can't be fixed in their settings.
// Each fix runs on the page as loaded and again on anything added later (e.g. search results).
(() => {
  'use strict';

  // Ajax Search Pro draws its icons as unlabeled SVGs, which checkers report as missing alternative text.
  // They're decorative (their buttons have their own labels), so hide them from screen readers.
  const ASP_AREAS = '.asp_w, .asp_r, .asp_s, .asp_sb, .asp_hidden_data, .asp_data_container';
  function hideAspIcons(root) {
    find(root, 'svg').forEach(svg => {
      if (svg.hasAttribute('aria-hidden') || svg.hasAttribute('aria-label') || svg.hasAttribute('aria-labelledby') || svg.querySelector('title')) return;
      if (!svg.closest(ASP_AREAS)) return;
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    });
  }

  // Divi's Video module with an image overlay adds an empty play link (<a class="et_pb_video_play" href="#">),
  // which checkers report as an empty link. Label it with the video's title and mark it as a button.
  function labelVideoPlayButtons(root) {
    find(root, '.et_pb_video_play').forEach(play => {
      if (play.hasAttribute('aria-label') || play.textContent.trim()) return;
      const title = play.closest('.et_pb_video')?.querySelector('iframe[title], video[title]')?.getAttribute('title')?.trim();
      play.setAttribute('aria-label', title ? `Play video: ${title}` : 'Play video');
      play.setAttribute('role', 'button');
    });
  }
  // Buttons also respond to Space; Enter already works because it's a link.
  document.addEventListener('keydown', event => {
    if (event.key !== ' ' || !(event.target instanceof Element)) return;
    const play = event.target.closest('.et_pb_video_play[role="button"]');
    if (!play) return;
    event.preventDefault(); // Space would otherwise scroll the page.
    play.click();
  });

  const fixes = [hideAspIcons, labelVideoPlayButtons];

  // root itself plus its descendants that match the selector.
  function find(root, selector) {
    const found = Array.from(root.querySelectorAll?.(selector) || []);
    if (root.matches?.(selector)) found.unshift(root);
    return found;
  }

  function init() {
    fixes.forEach(fix => fix(document.body));
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) fixes.forEach(fix => fix(node));
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
