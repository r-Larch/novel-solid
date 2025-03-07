import type { Editor } from "@tiptap/core";

import { mergeRefs } from "@solid-primitives/refs";
import { type JSX, type Ref, Show, createEffect, onCleanup, splitProps } from "solid-js";

export interface PureEditorContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  editor: Editor | undefined;
}

export function PureEditorContent(props: PureEditorContentProps) {
  let editorContainer!: HTMLDivElement;

  const [_, rest] = splitProps(props, ["ref", "editor"]);

  createEffect(() => {
    const editor = props.editor;

    if (editor && !editor.isDestroyed && editor.options.element) {

      const element = editorContainer;

      element.append(...editor.options.element.childNodes);

      editor.setOptions({
        element,
      });

      editor.createNodeViews();
    }
  });

  onCleanup(() => {
    const editor = props.editor;
    if (!editor) {
      return;
    }

    if (!editor.isDestroyed) {
      editor.view.setProps({
        nodeViews: {},
      });
    }

    if (!editor.options.element.firstChild) {
      return;
    }

    const newElement = document.createElement("div");

    newElement.append(...editor.options.element.childNodes);

    editor.setOptions({
      element: newElement,
    });
  });

  return (
    <div ref={mergeRefs(props.ref, editorContainer)} {...rest} />
  );
}

export interface EditorContentProps extends PureEditorContentProps { }

// EditorContent should be re-created whenever the Editor instance changes
export const EditorContent = (props: EditorContentProps) => {
  return (
    <Show when={props.editor} keyed>
      <PureEditorContent {...props} />
    </Show>
  );
};
