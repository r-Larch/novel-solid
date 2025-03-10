import type { Editor } from "@tiptap/core";
import { type Accessor, createComputed, createSignal, on, onCleanup } from "solid-js";
import { unwrap } from "solid-js/store";

/**
 * Configuration options for `createEditorState`.
 */
export type CreateEditorStateOptions<TSelectorResult> = {
  /**
   * An optional custom equality function used to determine
   * whether the selected value has actually changed. If it returns
   * `false`, the hook will signal a re-render.
   *
   * @defaultValue If not provided, `createSignal`'s default equality check is used
   * unless no `selector` is provided. In that case, changes are always signaled.
   *
   * @param current - The current value from the selector.
   * @param previous - The last recorded value from the selector.
   * @returns `true` if they're considered equal; `false` otherwise.
   */
  equals?: (current: TSelectorResult, previous: TSelectorResult | null) => boolean;
};

/**
 * A type describing a function that can retrieve part of the Editor
 * or its state. For example, extracting the current selection or checking
 * whether bold is active.
 */
type EditorSelector<TEditor, T> = (editor: TEditor) => T;

/**
 * Creates a reactive signal from a Tiptap Editor instance. It listens
 * for the `"transaction"` event on the editor, meaning any change
 * in the editor’s document or selection triggers the signal to update.
 *
 * - If no `selector` is provided, the entire editor instance is used
 *   as the reactive value.
 * - If you do provide a `selector`, you can extract just the part of
 *   the editor’s state you’re interested in (e.g., the current selection).
 * - Optionally, you can provide a custom `equals` function to fine-tune
 *   when the signal is updated.
 *
 * @typeParam TEditor - The Tiptap Editor type or `undefined`.
 * @typeParam TSelector - A function selecting a specific part of the editor’s state.
 * @typeParam TSelectorResult - The return type of your `selector`.
 *
 * @param editor - An accessor returning the current `Editor` instance. This can be `undefined`.
 * @param selector - A function that picks part of the editor’s state or instance to track.
 * @param options - Optional configuration, including a custom `equals` function.
 * @returns A SolidJS accessor for the selected value. If `selector` is not provided,
 *          the entire `Editor` object is returned.
 *
 * @example
 * ```tsx
 * import { createEditor } from '@tiptap/core';
 *
 * const MyComponent = () => {
 *   const editor = createEditor({ /* Tiptap Editor options *\/ });
 *
 *   // Listen for changes in the editor's current selection
 *   const currentSelection = createEditorState(
 *     editor,
 *     (editor) => editor.state.selection
 *   );
 *
 *   // Or, track the entire editor instance by omitting the selector
 *   const editorState = createEditorState(editor);
 *
 *   return (
 *     <div>
 *       <p>The current selection is: {JSON.stringify(currentSelection())}</p>
 *     </div>
 *   );
 * };
 * ```
 */
export function createEditorState<
  TEditor extends Editor | undefined,
  TSelector extends EditorSelector<TEditor, any> = EditorSelector<TEditor, TEditor>,
  TSelectorResult = TSelector extends EditorSelector<TEditor, infer T> ? T : never,
>(
  editor: Accessor<TEditor>,
  selector?: TSelector,
  options?: CreateEditorStateOptions<TSelectorResult>,
): Accessor<TSelectorResult> {
  // Derive the equality function from the options or fallback to default
  const equals = () => {
    // If a selector is provided, default to `undefined` => use createSignal's default
    // If no selector is provided, default to `false` => always signal change
    return options?.equals ?? (selector ? undefined : false);
  };

  // Use the selector if provided, else track the entire editor instance
  const selectorFn = selector ?? ((x) => x);

  // Create a signal whose value is initially derived from the editor
  const [selection, setSelection] = createSignal<TSelectorResult>(
    selectorFn(unwrap(editor())),
    { equals: equals() }
  );

  // Re-run whenever the `editor` accessor changes (e.g., becomes defined)
  createComputed(
    on(editor, (currentEditor) => {
      if (currentEditor) {
        // Function that updates our signal whenever the editor's transaction fires
        const handleTransaction = () => {
          setSelection(() => selectorFn(unwrap(currentEditor)));
        };

        // Trigger once on currentEditor change
        handleTransaction();

        // Listen for subsequent updates
        currentEditor.on("transaction", handleTransaction);

        // Cleanup when the `editor` changes or component unmounts
        onCleanup(() => {
          currentEditor.off("transaction", handleTransaction);
        });
      }
    })
  );

  return selection;
}
