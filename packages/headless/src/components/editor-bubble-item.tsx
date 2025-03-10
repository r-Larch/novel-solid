import { type Editor, useCurrentEditor } from "@tiptap/solid";
import { type JSX, Show, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { DomElement, DomElementAsProps } from "src/utils/types";

type EditorBubbleItemProps<E extends DomElement = 'div'> = DomElementAsProps<E, {
  readonly children: JSX.Element;
  readonly onSelect?: (editor: Editor) => void;
}>

export function EditorBubbleItem<E extends DomElement = 'div'>(props: EditorBubbleItemProps<E>) {
  const currentEditor = useCurrentEditor();

  const [_, rest] = splitProps(props, ["children", "onSelect"]);

  return (
    <Show when={currentEditor()}>
      <Dynamic component={props.as ?? 'div'}
        ref={props.ref}
        {...rest}
        onClick={() => props.onSelect?.(currentEditor()!)}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
};

export default EditorBubbleItem;
