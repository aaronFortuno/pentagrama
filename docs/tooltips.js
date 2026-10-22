import { motionOptions } from './motion.js?v=2.4.0';

// Keep the label inside the viewport, including the last controls in a sidebar or dialog.
export function tooltipPosition(anchor, size, viewport) {
  const edge = 8, gap = 8;
  const clamp = (value, max) => Math.max(edge, Math.min(value, Math.max(edge, max)));
  const above = anchor.top - gap - size.height;
  return {
    left: clamp((anchor.left + anchor.right - size.width) / 2, viewport.width - size.width - edge),
    top: clamp(above >= edge ? above : anchor.bottom + gap, viewport.height - size.height - edge),
  };
}

const bound = new WeakSet();
export function bindTooltips(root = document) {
  if (bound.has(root)) return;
  bound.add(root);
  const selector = '[data-tooltip], .icon-button[aria-label], .stepper button[aria-label], .number-actions button[aria-label]';
  const tooltip = root.createElement('div');
  tooltip.id = 'interface-tooltip'; tooltip.className = 'interface-tooltip';
  tooltip.setAttribute('role', 'tooltip'); tooltip.setAttribute('aria-hidden', 'true');
  const topLayer = typeof tooltip.showPopover === 'function';
  if (topLayer) tooltip.setAttribute('popover', 'manual'); else tooltip.hidden = true;
  root.body.append(tooltip);
  let active, pending, hovered, focused, point, overTooltip = false;
  let showTimer, leaveTimer, hideTimer;
  const text = target => (target?.dataset.tooltip ?? target?.getAttribute('aria-label') ?? '').trim();
  const targetAt = node => node?.closest?.(selector);
  function unlink() {
    if (!active) return;
    const ids = (active.getAttribute('aria-describedby') || '').split(/\s+/).filter(id => id && id !== tooltip.id);
    if (ids.length) active.setAttribute('aria-describedby', ids.join(' ')); else active.removeAttribute('aria-describedby');
  }
  function hide() {
    clearTimeout(showTimer); clearTimeout(leaveTimer); clearTimeout(hideTimer); pending = undefined;
    unlink(); active = undefined;
    tooltip.classList.remove('visible'); tooltip.setAttribute('aria-hidden', 'true');
    hideTimer = setTimeout(() => {
      if (topLayer) { if (tooltip.matches(':popover-open')) tooltip.hidePopover(); }
      else tooltip.hidden = true;
    }, motionOptions().duration);
  }
  function show(target) {
    const label = text(target);
    if (!target.isConnected || !target.getClientRects().length || target.closest('[inert], [hidden]') || !label) return;
    clearTimeout(hideTimer); active = target; pending = undefined;
    tooltip.textContent = label;
    const host = target.closest('dialog[open]') || root.body;
    if (tooltip.parentElement !== host) host.append(tooltip);
    // Manual popovers stay above dialogs without clipping at the scrolling sidebar.
    if (topLayer) tooltip.showPopover();
    else tooltip.hidden = false;
    const rect = target.getBoundingClientRect();
    const anchor = hovered === target && point && (rect.width > 360 || rect.height > 100)
      ? { left: point.x, right: point.x, top: point.y, bottom: point.y + 4 } : rect;
    const position = tooltipPosition(anchor, tooltip.getBoundingClientRect(), { width: innerWidth, height: innerHeight });
    tooltip.style.left = `${position.left}px`; tooltip.style.top = `${position.top}px`;
    // Icon buttons already have a spoken name: avoid reading that name twice.
    if (label !== target.getAttribute('aria-label')) {
      const ids = new Set((target.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      ids.add(tooltip.id); target.setAttribute('aria-describedby', [...ids].join(' '));
    }
    tooltip.setAttribute('aria-hidden', 'false'); tooltip.classList.add('visible');
  }
  function request(target, delay) {
    clearTimeout(leaveTimer);
    if (target === active) return;
    hide(); if (!target || !text(target)) return;
    pending = target;
    showTimer = setTimeout(() => { if (pending === target && (hovered === target || focused === target)) show(target); }, delay);
  }
  function leave() {
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      if (!overTooltip && (!active || active !== hovered && active !== focused)) hide();
    }, 120);
  }
  root.addEventListener('pointerover', event => {
    if (event.pointerType === 'touch') return;
    if (tooltip.contains(event.target)) { overTooltip = true; clearTimeout(leaveTimer); return; }
    const target = targetAt(event.target);
    if (target && target === targetAt(event.relatedTarget)) return;
    hovered = target; point = { x: event.clientX, y: event.clientY };
    if (target) request(target, 450);
  });
  root.addEventListener('pointerout', event => {
    if (event.pointerType === 'touch') return;
    if (tooltip.contains(event.target)) {
      if (tooltip.contains(event.relatedTarget)) return;
      overTooltip = false; leave(); return;
    }
    if (targetAt(event.target) === targetAt(event.relatedTarget)) return;
    hovered = undefined; leave();
  });
  root.addEventListener('focusin', event => {
    const target = targetAt(event.target);
    if (target?.matches(':focus-visible')) { focused = target; request(target, 120); }
  });
  root.addEventListener('focusout', event => { if (targetAt(event.target) === focused) { focused = undefined; leave(); } });
  root.addEventListener('pointerdown', () => { focused = undefined; overTooltip = false; hide(); }, true);
  root.addEventListener('input', hide, true);
  root.addEventListener('scroll', event => { if (!tooltip.contains(event.target)) hide(); }, { capture: true, passive: true });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && (active || pending)) { event.preventDefault(); event.stopPropagation(); hide(); }
    else if (['Tab', 'Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) hide();
  }, true);
  root.addEventListener('beforetoggle', event => { if (event.target.matches('dialog')) hide(); }, true);
  window.addEventListener('resize', hide); window.addEventListener('blur', hide); window.addEventListener('beforeprint', hide);
  new MutationObserver(() => {
    if (active && (!active.isConnected || active.closest('[inert], [hidden]') || text(active) !== tooltip.textContent)) hide();
  }).observe(root.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-tooltip', 'aria-label', 'hidden', 'inert'] });
}
