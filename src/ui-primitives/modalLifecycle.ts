const scrollLocks = new WeakMap<Document, { count: number; value: string; priority: string }>();

export function tabStops(element: HTMLDialogElement) {
  return Array.from(element.querySelectorAll<HTMLElement>(
    'button, input, select, textarea, a[href], summary, [tabindex]',
  )).filter(node => {
    const collapsed = node.closest('details:not([open])');
    const inClosedSummary = !collapsed || node === collapsed || collapsed.querySelector(':scope > summary')?.contains(node);
    return inClosedSummary && node.tabIndex >= 0 && !node.matches(':disabled') && !node.closest('[hidden], [inert]')
      && node.getClientRects().length > 0 && element.ownerDocument.defaultView?.getComputedStyle(node).visibility !== 'hidden';
  });
}

export function lockScrolling(owner: Document) {
  let lock = scrollLocks.get(owner);
  if (!lock) {
    lock = { count: 0, value: owner.body.style.getPropertyValue('overflow'), priority: owner.body.style.getPropertyPriority('overflow') };
    scrollLocks.set(owner, lock);
    owner.body.style.setProperty('overflow', 'hidden');
  }
  lock.count++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--lock.count) return;
    if (lock.value) owner.body.style.setProperty('overflow', lock.value, lock.priority);
    else owner.body.style.removeProperty('overflow');
    scrollLocks.delete(owner);
  };
}
