import { normalizeSettings } from './layout.js?v=1.16.0';

// Keep full, independent snapshots: block names and footer choices matter too.
export function createSettingsHistory(initial, { limit = 100 } = {}) {
  const capacity = Math.max(1, Math.floor(limit) || 100);
  const snapshot = value => JSON.stringify(normalizeSettings(value));
  let entries = [snapshot(initial)], index = 0, activeGroup;
  return {
    get canUndo() { return index > 0; },
    get canRedo() { return index < entries.length - 1; },
    endGroup() { activeGroup = undefined; },
    record(value, { group } = {}) {
      const next = snapshot(value);
      if (next === entries[index]) return false;
      if (group && group === activeGroup && index === entries.length - 1) {
        if (next === entries[index - 1]) { entries.pop(); index--; activeGroup = undefined; }
        else entries[index] = next;
      } else {
        entries = entries.slice(0, index + 1); entries.push(next); index++;
        if (entries.length > capacity + 1) { entries.shift(); index--; }
        activeGroup = group;
      }
      return true;
    },
    undo() { activeGroup = undefined; if (index === 0) return; return JSON.parse(entries[--index]); },
    redo() { activeGroup = undefined; if (index === entries.length - 1) return; return JSON.parse(entries[++index]); },
  };
}

// Native text editing and dialogs retain their own keyboard shortcuts.
export function historyShortcut(event) {
  if (event.defaultPrevented || event.altKey || !(event.ctrlKey || event.metaKey)) return;
  const target = event.target;
  if (target?.isContentEditable || target?.closest?.('dialog[open],input:not([type=range]),textarea,select,[contenteditable=true]')) return;
  const key = event.key.toLowerCase();
  if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
  if (key === 'y' && !event.shiftKey) return 'redo';
}
