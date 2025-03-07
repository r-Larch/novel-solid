import { type Editor, useCurrentEditor } from "@tiptap/solid";
import { type JSX, Show, splitProps } from "solid-js";

interface EditorBubbleItemProps {
  readonly children: JSX.Element;
  readonly onSelect?: (editor: Editor) => void;
}

export const EditorBubbleItem = (props: EditorBubbleItemProps & Omit<JSX.IntrinsicElements["div"], "onSelect">) => {
  const currentEditor = useCurrentEditor();

  const [_, rest] = splitProps(props, ["children", "onSelect"]);

  return (
    <Show when={currentEditor()}>
      <div ref={props.ref} {...rest} onClick={() => props.onSelect?.(currentEditor()!)}>
        {props.children}
      </div>
    </Show>
  );
};

export default EditorBubbleItem;
