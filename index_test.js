// Minimal test to verify import paths
import {
    eventSource,
    event_types,
    saveSettingsDebounced,
    setExtensionPrompt,
} from '../../../../script.js';
import {
    extension_settings,
    getContext,
} from '../../../extensions.js';

console.log('[BubbleDialogue TEST] All imports loaded successfully');
console.log('[BubbleDialogue TEST] eventSource:', typeof eventSource);
console.log('[BubbleDialogue TEST] event_types:', typeof event_types);
console.log('[BubbleDialogue TEST] saveSettingsDebounced:', typeof saveSettingsDebounced);
console.log('[BubbleDialogue TEST] setExtensionPrompt:', typeof setExtensionPrompt);
console.log('[BubbleDialogue TEST] extension_settings:', typeof extension_settings);
console.log('[BubbleDialogue TEST] getContext:', typeof getContext);

window.__BUBBLE_TEST_OK__ = true;
console.log('[BubbleDialogue TEST] PASSED');

export function init() {
    console.log('[BubbleDialogue TEST] init() called');
}
