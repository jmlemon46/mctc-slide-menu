(() => {
  'use strict';
  const mobile = window.matchMedia('(max-width: 980px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let active = null;

  function init() {
    document.querySelectorAll('.mctc-widget').forEach(widget => {
      const trigger = widget.querySelector('.mctc-trigger');
      const dialog = widget.querySelector('.mctc-dialog');
      if (!trigger || !dialog || trigger.dataset.ready) return;
      trigger.dataset.ready = 'true';
      // Move outside page-builder/header containers; native dialog supplies modal focus isolation.
      document.body.append(dialog);
      const closeButton = dialog.querySelector('.mctc-close');
      let timer, opener;
      let closing = false;
      let locked = false;
      let sequence = 0;
      dialog.querySelectorAll('li').forEach(li => {
        const link = Array.from(li.children).find(el => el.tagName === 'A');
        if (!link) return;
        const submenu = Array.from(li.children).find(el => el.tagName === 'UL');
        const row = document.createElement('div');
        row.className = 'mctc-row';
        li.insertBefore(row, link);
        row.append(link);
        if (!submenu) return;
        submenu.id = `${dialog.id}-sub-${++sequence}`;
        const expanded = li.classList.contains('current-menu-ancestor') || li.classList.contains('current-menu-item');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'mctc-expand';
        button.setAttribute('aria-controls', submenu.id);
        // Fixed label; aria-expanded announces the open/closed state on its own.
        button.setAttribute('aria-label', `${link.textContent.trim()} sub pages`);
        const setExpanded = value => {
          button.setAttribute('aria-expanded', String(value));
          submenu.hidden = !value;
        };
        button.innerHTML = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="m4 7 5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        setExpanded(expanded);
        button.addEventListener('click', () => setExpanded(button.getAttribute('aria-expanded') !== 'true'));
        row.append(button);
      });

      // Runs on every close path, including ones the browser performs itself
      // (e.g. a repeated Escape or Android back gesture), so the page never stays locked.
      function unlock() {
        clearTimeout(timer);
        dialog.classList.remove('is-open');
        closing = false;
        if (!locked) return;
        locked = false;
        document.documentElement.classList.remove('mctc-locked');
        trigger.setAttribute('aria-expanded', 'false');
        if (active?.dialog === dialog) active = null;
        if (opener?.isConnected) opener.focus({ preventScroll: true });
      }
      // The close event is async, so unlock synchronously too (needed before same-page anchors scroll).
      function finishClose() {
        if (dialog.open) dialog.close();
        unlock();
      }
      function close() {
        if (!dialog.open || closing) return;
        closing = true;
        dialog.classList.remove('is-open');
        if (reduced.matches) finishClose();
        else timer = window.setTimeout(finishClose, 280);
      }
      trigger.addEventListener('click', () => {
        if (dialog.open) return;
        if (active) active.finishClose();
        opener = trigger;
        document.documentElement.classList.add('mctc-locked');
        locked = true;
        dialog.showModal();
        // showModal() focuses the X while the panel is still off-screen, and browsers scroll the
        // dialog sideways to reveal it; undo that so the slide-in starts from the right edge.
        dialog.scrollLeft = 0;
        active = { dialog, finishClose };
        trigger.setAttribute('aria-expanded', 'true');
        // Force the starting position before activating the opening transition.
        void dialog.offsetWidth;
        dialog.classList.add('is-open');
        closeButton.focus({ preventScroll: true });
      });
      closeButton.addEventListener('click', close);
      dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
      // The close event fires asynchronously; ignore a late one that lands after a quick reopen.
      dialog.addEventListener('close', () => { if (!dialog.open) unlock(); });
      let outsideDown = false;
      dialog.addEventListener('pointerdown', event => { outsideDown = event.target === dialog; });
      dialog.addEventListener('click', event => {
        if (event.target === dialog && outsideDown) close();
        const link = event.target.closest('a');
        // Unlock before the browser follows links, including same-page anchors.
        if (link && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && link.target !== '_blank') finishClose();
      });
      mobile.addEventListener('change', () => {
        if (dialog.open) closeButton.focus({ preventScroll: true });
      });
      trigger.hidden = false;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
