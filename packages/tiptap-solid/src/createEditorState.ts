import type { Editor } from "@tiptap/core";
import { type Accessor, createComputed, createSignal, on, onCleanup } from "solid-js";


export type CreateEditorStateOptions<TSelectorResult> = {
  /**
   * A custom equality function to determine when to signal a change.
   */
  equals?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};

type EditorSelector<TEditor, T> = ((context: TEditor) => T);

/**
 * This hook allows you to watch for changes on the editor instance.
 * It will allow you to select a part of the editor state and re-render the component when it changes.
 * @param editor The editor instance.
 * @param selector A selector function to determine the value to compare for re-rendering.
 * @param options Allows to use a custom comparison function in equals for the selector result.
 * @example
 * ```tsx
 * const editor = createEditor({...options})
 * const currentSelection = createEditorState(
 *  editor,
 *  editor => editor.state.selection
 * )
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
  /**
   * The equals function determines when to signal a change.
   * false means a change is signaled on every set.
   * undefined means the default value comparision is used.
   */
  const equals = () => {
    return options?.equals ?? (selector ? undefined : false);
  }

  /**
   * The value selector function:
   * If no selector is provided the editor instance is selected.
   */
  const selectorFn = selector ?? ((x) => x);

  const [selection, setSelection] = createSignal<TSelectorResult>(selectorFn(editor()), { equals: equals() })

  createComputed(on(editor, editor => {
    if (editor) {
      /**
       * This will yield a change when the editor state changes.
       * This is to support things like `editor.can().toggleBold()`.
       */
      const fn = () => {
        console.log('transaction')
        setSelection(() => selectorFn(editor))
      };

      fn();
      editor.on("transaction", fn);
      onCleanup(() => editor.off("transaction", fn))
    }
  }))

  return selection;
}
