import type { Editor } from "@tiptap/core";

import { type Accessor, type Component, type JSX, Show, createContext, useContext } from "solid-js";
import { EditorContent } from "./EditorContent.js";
import { type CreateEditorOptions, createEditor } from "./createEditor.js";

export type EditorContextValue = Accessor<Editor | undefined>;

export const EditorContext = createContext<EditorContextValue>(() => undefined);

export const EditorConsumer: Component<{ children: (context: EditorContextValue) => JSX.Element }> = (props) =>
  props.children(useContext(EditorContext));

/**
 * A hook to get the current editor instance.
 */
export const useCurrentEditor = () => useContext(EditorContext);

export type EditorProviderProps = {
  children?: JSX.Element;
  slotBefore?: JSX.Element;
  slotAfter?: JSX.Element;
  editorContainerProps?: JSX.HTMLAttributes<HTMLDivElement>;
} & CreateEditorOptions;

/**
 * This is the provider component for the editor.
 * It allows the editor to be accessible across the entire component tree
 * with `useCurrentEditor`.
 */
export function EditorProvider({
  children,
  slotAfter,
  slotBefore,
  editorContainerProps = {},
  ...editorOptions
}: EditorProviderProps) {
  const editor = createEditor(editorOptions);
  return (
    <Show when={editor()}>
      <EditorContext.Provider value={editor}>
        {slotBefore}
        <EditorContent editor={editor()} {...editorContainerProps} />
        {children}
        {slotAfter}
      </EditorContext.Provider>
    </Show>
  );
}
