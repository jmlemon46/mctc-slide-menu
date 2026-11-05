// MCTC header search: .search-icon toggles #header-search-section (styles in assets/css/header-search.css).
// Everything is looked up when it's used, so it still works if Divi renders the header late.
(() => {
  'use strict';
  const SECTION_ID = 'header-search-section';
  const ICON = '.search-icon';
  // Ajax Search Pro panels that can live outside the section; clicks in them must not close it.
  const ASP_PANELS = '.asp_r, .asp_s, .asp_sb';

  const section = () => document.getElementById(SECTION_ID);
  const icons = () => Array.from(document.querySelectorAll(ICON));
  const isOpen = () => !!section()?.classList.contains('is-open');

  // Divi's icon module is a plain <div>: make every copy a keyboard-usable button.
  function prepareIcons() {
    icons().forEach(icon => {
      icon.setAttribute('aria-expanded', String(isOpen()));
      if (icon.dataset.mctcSearch) return;
      icon.dataset.mctcSearch = 'true';
      icon.setAttribute('role', 'button');
      icon.setAttribute('tabindex', '0');
      icon.setAttribute('aria-controls', SECTION_ID);
      if (!icon.hasAttribute('aria-label')) icon.setAttribute('aria-label', 'Search');
      // The icon font glyph is a letter; keep screen readers from reading it.
      icon.querySelectorAll('.et-pb-icon').forEach(glyph => glyph.setAttribute('aria-hidden', 'true'));
    });
  }

  function open() {
    const el = section();
    if (!el) return;
    el.classList.add('is-open');
    prepareIcons();
    // preventScroll: the bar overlays the page, so the page must not jump to it.
    el.querySelector('input.orig')?.focus({ preventScroll: true });
  }
  const visibleIcon = () => icons().find(icon => icon.offsetParent !== null);
  function close(returnFocusTo) {
    if (!isOpen()) return;
    const el = section();
    // Don't leave keyboard focus on a field that's about to be hidden.
    if (!returnFocusTo && el.contains(document.activeElement)) returnFocusTo = visibleIcon();
    el.classList.remove('is-open');
    prepareIcons();
    returnFocusTo?.focus({ preventScroll: true });
  }
  const toggle = () => (isOpen() ? close() : open());

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(ICON)) {
      event.preventDefault();
      toggle();
      return;
    }
    // Opening the hamburger menu closes the search, so both are never open at once.
    if (event.target.closest('.mctc-trigger')) { close(); return; }
    if (isOpen() && !section().contains(event.target) && !event.target.closest(ASP_PANELS)) close();
  });

  document.addEventListener('keydown', event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest(ICON) && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault(); // Space would otherwise scroll the page.
      toggle();
      return;
    }
    if (event.key === 'Escape' && isOpen()) {
      close(event.target.closest(ICON) || visibleIcon());
    }
  });

  // Ajax Search Pro draws its icons as unlabeled SVGs, which accessibility checkers report as missing
  // alternative text. They're decorative (their buttons have their own labels), so hide them from screen
  // readers. It adds more icons with each set of results, so newly added ones are handled too.
  const ASP_AREAS = '.asp_w, .asp_r, .asp_s, .asp_sb, .asp_hidden_data, .asp_data_container';
  function hideAspIcons(root) {
    const svgs = root.matches?.('svg') ? [root] : Array.from(root.querySelectorAll?.('svg') || []);
    svgs.forEach(svg => {
      if (svg.hasAttribute('aria-hidden') || svg.hasAttribute('aria-label') || svg.hasAttribute('aria-labelledby') || svg.querySelector('title')) return;
      if (!svg.closest(ASP_AREAS)) return;
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
    });
  }
  function watchAspIcons() {
    hideAspIcons(document.body);
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) hideAspIcons(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    prepareIcons();
    watchAspIcons();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
