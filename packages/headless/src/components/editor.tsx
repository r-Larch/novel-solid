import type { JSONContent } from "@tiptap/core";
import { EditorProvider, type EditorProviderProps } from "@tiptap/solid";
import { type Component, type JSX, type Ref, splitProps } from "solid-js";
import tunnel from "../utils/tunnel-rat";
import { EditorCommandTunnelContext } from "../utils/tunnel-rat";
import { NovelStoreProvider } from "../utils/store";

interface EditorRootProps {
  readonly children: JSX.Element;
}

export const EditorRoot: Component<EditorRootProps> = (props) => {
  const tunnelInstance = tunnel();
  return (
    <NovelStoreProvider>
      <EditorCommandTunnelContext.Provider value={tunnelInstance}>
        {props.children}
      </EditorCommandTunnelContext.Provider>
    </NovelStoreProvider>
  );
};

export type EditorContentProps = Omit<EditorProviderProps, "content"> & {
  readonly ref?: Ref<HTMLDivElement>;
  readonly children?: JSX.Element;
  readonly class?: string;
  readonly initialContent?: JSONContent;
};

export const EditorContent: Component<EditorContentProps> = (props) => {
  const [_, rest] = splitProps(props, ["class", "children", "initialContent"]);
  return (
    <div ref={props.ref} class={props.class}>
      <EditorProvider {...rest} content={props.initialContent}>
        {props.children}
      </EditorProvider>
    </div>
  );
};
