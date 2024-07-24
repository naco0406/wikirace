"use client";

import { useEffect, useRef, useCallback } from 'react';

type KeyCombo = string[];
type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardOptions {
    target?: EventTarget;
    enabled?: boolean;
}

export const useKeyboard = (
    keyMap: Record<string, KeyHandler>,
    options: KeyboardOptions = {}
) => {
    const { target = globalThis, enabled = true } = options;
    const keyMapRef = useRef(keyMap);
    const pressedKeys = useRef<Set<string>>(new Set());

    const handleKeyDown = useCallback(
        (event: Event) => {
            if (!enabled) return;

            const keyboardEvent = event as KeyboardEvent;
            const key = keyboardEvent.key.toLowerCase();
            pressedKeys.current.add(key);
            if (keyboardEvent.metaKey) pressedKeys.current.add('meta');
            if (keyboardEvent.ctrlKey) pressedKeys.current.add('ctrl');

            // Check for key combinations
            for (const [combo, handler] of Object.entries(keyMapRef.current)) {
                const keys = combo.toLowerCase().split('+');
                if (keys.every(k => pressedKeys.current.has(k))) {
                    keyboardEvent.preventDefault();
                    handler(keyboardEvent);
                    break;
                }
            }
        },
        [enabled]
    );

    const handleKeyUp = useCallback(
        (event: Event) => {
            const keyboardEvent = event as KeyboardEvent;
            const key = keyboardEvent.key.toLowerCase();
            pressedKeys.current.delete(key);
            if (!keyboardEvent.metaKey) pressedKeys.current.delete('meta');
            if (!keyboardEvent.ctrlKey) pressedKeys.current.delete('ctrl');
        },
        []
    );

    useEffect(() => {
        keyMapRef.current = keyMap;
    }, [keyMap]);

    useEffect(() => {
        if (!enabled) return;

        target.addEventListener('keydown', handleKeyDown);
        target.addEventListener('keyup', handleKeyUp);

        return () => {
            target.removeEventListener('keydown', handleKeyDown);
            target.removeEventListener('keyup', handleKeyUp);
        };
    }, [target, enabled, handleKeyDown, handleKeyUp]);

    const isPressed = useCallback(
        (keyCombo: string | KeyCombo) => {
            const keys = Array.isArray(keyCombo) ? keyCombo : keyCombo.toLowerCase().split('+');
            return keys.every(key => pressedKeys.current.has(key === 'cmd' ? 'meta' : key));
        },
        []
    );

    return { isPressed };
};