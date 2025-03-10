import { Accessor, createComputed, createEffect, createSignal, on, Signal } from "solid-js";


export function createParameterSignal<T>(value: Accessor<T>, setValue: (value: T) => void): Signal<T> {
    const [prop, setProp] = createSignal(value?.());
    createComputed(() => setProp(() => value?.()));
    createEffect(on(prop, open => open !== value?.() && setValue?.(open), { defer: true }));
    return [prop, setProp];
}
