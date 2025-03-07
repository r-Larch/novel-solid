import { CommandEmpty, CommandItem } from "cmdk-solid";
import { useCurrentEditor } from "@tiptap/solid";
import { type ComponentProps, Show, splitProps } from "solid-js";
import type { Editor, Range } from "@tiptap/core";
import { useNovelStore } from "../utils/store";

interface EditorCommandItemProps {
  readonly onCommand: ({
    editor,
    range,
  }: {
    editor: Editor;
    range: Range;
  }) => void;
}

export const EditorCommandItem = (props: EditorCommandItemProps & ComponentProps<typeof CommandItem>) => {
  const currentEditor = useCurrentEditor();
  const [novel] = useNovelStore();

  const [_, rest] = splitProps(props, ["children", "onCommand"]);

  return (
    <Show when={currentEditor() && novel.range}>
      <CommandItem ref={props.ref} {...rest} onSelect={() => props.onCommand({ editor: currentEditor()!, range: novel.range! })}>
        {props.children}
      </CommandItem>
    </Show>
  );
};

export const EditorCommandEmpty = CommandEmpty;

export default EditorCommandItem;
