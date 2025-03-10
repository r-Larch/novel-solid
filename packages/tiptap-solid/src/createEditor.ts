import { Editor, type EditorOptions } from "@tiptap/core";

import { type Accessor, createEffect, createMemo, createSignal, getOwner, on, onCleanup, onMount, Signal } from "solid-js";
import { isServer } from "solid-js/web";
import { setTiptapSolidReactiveOwner } from "./ReactiveOwner";
import { createEditorState } from "./createEditorState";
import { $RAW, Store } from "solid-js/store";

const isDev = import.meta.env.DEV;

/**
 * The options for the `createEditor` hook.
 */
export type CreateEditorOptions = Partial<EditorOptions> & {
  /**
   * Whether to render the editor on the first render.
   * If client-side rendering, set this to `true`.
   * If server-side rendering, set this to `false`.
   * @default true
   */
  immediatelyRender?: boolean;
};


/**
 * Detects if editor should immediately render.
 */
const shouldImmediatelyRender = (options: CreateEditorOptions): boolean => {
  if (options.immediatelyRender === undefined) {
    if (isServer) {
      if (isDev) {
        /**
         * Throw an error in development, to make sure the developer is aware that tiptap cannot be SSR'd
         * and that they need to set `immediatelyRender` to `false` to avoid hydration mismatches.
         */
        throw new Error(
          "Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.",
        );
      }

      // Best faith effort in production, run the code in the legacy mode to avoid hydration mismatches and errors in production
      return false;
    }

    // Default to immediately rendering when client-side rendering
    return true;
  }

  if (options.immediatelyRender && isServer && isDev) {
    // Warn in development, to make sure the developer is aware that tiptap cannot be SSR'd, set `immediatelyRender` to `false` to avoid hydration mismatches.
    throw new Error(
      "Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.",
    );
  }

  if (options.immediatelyRender) {
    return true;
  }

  return false;
}


/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @returns The editor instance
 * @example const editor = createEditor({ extensions: [...] })
 */
export function createEditor(options: CreateEditorOptions & { immediatelyRender: true }): Accessor<Editor>;

/**
 * This hook allows you to create an editor instance.
 * @param options The editor options
 * @returns The editor instance
 * @example const editor = createEditor({ extensions: [...] })
 */
export function createEditor(options?: CreateEditorOptions): Accessor<Editor | undefined>;

export function createEditor(options: CreateEditorOptions = {}): Accessor<Editor | undefined> {
  const owner = getOwner()

  /**
   * Create a new editor instance.
   */
  const createEditorInstance = (options: CreateEditorOptions): Editor => {
    const editor = new Editor(options);

    // store the owner for retrieval in SolidRenderer:
    setTiptapSolidReactiveOwner(editor, owner)

    return editor;
  }

  const [instance, setInstance] = createSignal<Editor | undefined>(
    shouldImmediatelyRender(options) ? createEditorInstance(options) : undefined
  );

  // create the editor on mount and handle destoy on unmount
  onMount(() => {
    const editor = instance()
    if (!editor || editor.isDestroyed) {
      setInstance(createEditorInstance(options));
    }

    onCleanup(() => {
      const editor = instance()
      if (editor && !editor.isDestroyed) {
        editor.destroy();
        setInstance();
      }
    })
  })

  // update editor options on options change
  createEffect(on(
    // options my be composed with signalas, so ensure all signals are tracked to re-run the effect on options change.
    () => ({ ...options, extensions: [...options.extensions ?? []] }),
    options => {
      const editor = instance()
      if (editor && !editor.isDestroyed) {
        editor.setOptions(options)
      }
    },
    { defer: true } // defer this effect to prevent setOptions immediately after editor creation^as options would be the same.
  ));

  // create a reactive editor to support things like `editor().can().bold()`
  const reactiveEditor = createReactiveEditor(instance);

  return reactiveEditor;
}


function createReactiveEditor(editor: Accessor<Editor | undefined>) {
  const state = createEditorState(editor);

  let editorProxy: Store<Editor & { [$RAW]?: Editor }> | undefined;
  const reactiveEditor = createMemo(on(editor, (editor) => {
    if (editor) {
      if (editor === editorProxy?.[$RAW]) {
        return editorProxy;
      }
      else {
        return editorProxy = new Proxy(editor, createProxyHandler(state as Accessor<Editor>))
      }
    }
    else {
      return undefined;
    }
  }))

  return reactiveEditor;
}


function createProxyHandler(state: Accessor<Editor>): ProxyHandler<Editor> {
  const reactiveProps: Array<string | Symbol> = ['can', 'isActive', 'isFocused', 'isInitialized', 'isEditable', 'getAttributes', 'isEmpty', '$node', '$nodes', '$pos', '$doc'];
  return {
    get(target, property, receiver) {
      if (property === $RAW) {
        return target;
      }
      else if (reactiveProps.includes(property)) {
        return (state() as any)[property];
      }
      else {
        return (target as any)[property]
      }
    },
  }
}
