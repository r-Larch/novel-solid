import type { Editor } from "@tiptap/core";
import deepEqual from "fast-deep-equal/es6";
import { type Accessor, createRenderEffect, onCleanup } from "solid-js";
import { useSyncExternalStoreWithSelector } from "./utils/useSyncExternalStore";

export type EditorStateSnapshot<TEditor extends Editor | null = Editor | null> = {
  editor: TEditor;
  transactionNumber: number;
};

/**
 * To synchronize the editor instance with the component state,
 * we need to create a separate instance that is not affected by the component re-renders.
 */
class EditorStateManager<TEditor extends Editor | null = Editor | null> {
  private transactionNumber = 0;

  private lastTransactionNumber = 0;

  private lastSnapshot: EditorStateSnapshot<TEditor>;

  private editor: TEditor;

  private subscribers = new Set<() => void>();

  constructor(initialEditor: TEditor) {
    this.editor = initialEditor;
    this.lastSnapshot = { editor: initialEditor, transactionNumber: 0 };

    this.getSnapshot = this.getSnapshot.bind(this);
    this.getServerSnapshot = this.getServerSnapshot.bind(this);
    this.watch = this.watch.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }

  /**
   * Get the current editor instance.
   */
  getSnapshot(): EditorStateSnapshot<TEditor> {
    if (this.transactionNumber === this.lastTransactionNumber) {
      return this.lastSnapshot;
    }
    this.lastTransactionNumber = this.transactionNumber;
    this.lastSnapshot = { editor: this.editor, transactionNumber: this.transactionNumber };
    return this.lastSnapshot;
  }

  /**
   * Always disable the editor on the server-side.
   */
  getServerSnapshot(): EditorStateSnapshot<null> {
    return { editor: null, transactionNumber: 0 };
  }

  /**
   * Subscribe to the editor instance's changes.
   */
  subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Watch the editor instance for changes.
   */
  watch(nextEditor: Editor | null): undefined | (() => void) {
    this.editor = nextEditor as TEditor;

    if (this.editor) {
      /**
       * This will force a re-render when the editor state changes.
       * This is to support things like `editor.can().toggleBold()` in components that `createEditor`.
       * This could be more efficient, but it's a good trade-off for now.
       */
      const fn = () => {
        this.transactionNumber += 1;
        this.subscribers.forEach((callback) => callback());
      };

      const currentEditor = this.editor;

      currentEditor.on("transaction", fn);
      return () => {
        currentEditor.off("transaction", fn);
      };
    }

    return undefined;
  }
}

export type CreateEditorStateOptions<TSelectorResult> = {
  /**
   * A custom equality function to determine if the editor should re-render.
   * @default `deepEqual` from `fast-deep-equal`
   */
  equals?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};

/**
 * This hook allows you to watch for changes on the editor instance.
 * It will allow you to select a part of the editor state and re-render the component when it changes.
 * @param editor The editor instance.
 * @param selector A selector function to determine the value to compare for re-rendering.
 * @param options Allows to use a custom comparison function in equals for the selector result.
 * @example
 * ```tsx
 * const editor = createEditor({...options})
 * const { currentSelection } = createEditorState(
 *  editor,
 *  snapshot => ({ currentSelection: snapshot.editor.state.selection })
 * )
 */
export function createEditorState<TSelectorResult, TEditor extends Editor | undefined = Editor | undefined>(
  editor: Accessor<TEditor>,
  selector: (context: EditorStateSnapshot<Editor | null>) => TSelectorResult,
  options?: CreateEditorStateOptions<TSelectorResult>,
): Accessor<TSelectorResult | null> {
  const editorStateManager = new EditorStateManager(editor() ?? null);

  // Using the `useSyncExternalStore` hook to sync the editor instance with the component state
  const selectedState = useSyncExternalStoreWithSelector(
    editorStateManager.subscribe,
    editorStateManager.getSnapshot,
    editorStateManager.getServerSnapshot as any,
    selector,
    options?.equals ?? deepEqual,
  );

  createRenderEffect(() => {
    const dispose = editorStateManager.watch(editor() ?? null);
    onCleanup(() => dispose?.());
  });

  return selectedState;
}
