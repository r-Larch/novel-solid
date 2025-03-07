import { Editor, type EditorOptions } from "@tiptap/core";

import { type Accessor, createSignal, getOwner, onCleanup, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import { setTiptapSolidReactiveOwner } from "./ReactiveOwner";

const isDev = process.env.NODE_ENV !== "production";

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

  onMount(() => {
    const editor = instance()
    if (!editor || editor.isDestroyed) {
      setInstance(createEditorInstance(options));
    }
  });

  onCleanup(() => {
    const editor = instance()
    if (editor && !editor.isDestroyed) {
      editor.destroy();
      setInstance();
    }
  })

  return instance;
}
