import type { Range } from "@tiptap/core";
import { Command } from "cmdk-solid";
import { type Component, type ComponentProps, createComputed, getOwner, onCleanup, onMount, splitProps } from "solid-js";
import { useNovelStore } from "../utils/store";
import { EditorCommandTunnelContext } from "../utils/tunnel-rat";

interface EditorCommandOutProps {
  readonly query: string;
  readonly range: Range;
}

export const EditorCommandOut: Component<EditorCommandOutProps> = (props) => {
  const [novel, setNovel] = useNovelStore();

  createComputed(() => {
    setNovel({
      query: props.query,
      range: props.range
    });
  });

  onMount(() => {
    const navigationKeys = ["ArrowUp", "ArrowDown", "Enter"];
    const onKeyDown = (e: KeyboardEvent) => {
      if (navigationKeys.includes(e.key)) {
        e.preventDefault();
        const commandRef = document.querySelector("#slash-command");

        if (commandRef)
          commandRef.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: e.key,
              cancelable: true,
              bubbles: true,
            }),
          );

        return false;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", onKeyDown);
    })
  });

  return (
    <EditorCommandTunnelContext.Consumer>
      {(tunnelInstance) => <tunnelInstance.Out />}
    </EditorCommandTunnelContext.Consumer>
  );
};

export function EditorCommand(props: ComponentProps<typeof Command>) {
  const [novel, setNovel] = useNovelStore();

  const [_, rest] = splitProps(props, ["children", "class"]);

  return (
    <EditorCommandTunnelContext.Consumer>
      {(tunnelInstance) => (
        <tunnelInstance.In>
          <Command
            ref={props.ref}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
            id="slash-command"
            class={props.class}
            {...rest}
          >
            <Command.Input value={novel.query} onValueChange={query => setNovel({ query })} style={{ display: "none" }} />
            {props.children}
          </Command>
        </tunnelInstance.In>
      )}
    </EditorCommandTunnelContext.Consumer>
  );
};

export const EditorCommandList = Command.List;
