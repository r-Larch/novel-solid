import { BubbleMenuPlugin, type BubbleMenuPluginProps } from "@tiptap/extension-bubble-menu";

import { type JSX, createEffect, createSignal, onCleanup } from "solid-js";
import { useCurrentEditor } from "./Context.js";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type BubbleMenuProps = Omit<Optional<BubbleMenuPluginProps, "pluginKey">, "element" | "editor"> & {
  editor: BubbleMenuPluginProps["editor"] | undefined;
  class?: string;
  children: JSX.Element;
  updateDelay?: number;
};

export const BubbleMenu = (props: BubbleMenuProps) => {
  const [element, setElement] = createSignal<HTMLDivElement | null>(null);
  const currentEditor = useCurrentEditor();

  createEffect(() => {
    const e = element();
    if (!e) {
      return;
    }

    if (props.editor?.isDestroyed || currentEditor()?.isDestroyed) {
      return;
    }

    const { pluginKey = "bubbleMenu", editor, tippyOptions = {}, updateDelay, shouldShow = null } = props;

    const menuEditor = editor || currentEditor();

    if (!menuEditor) {
      console.warn("BubbleMenu component is not rendered inside of an editor component or does not have editor prop.");
      return;
    }

    const plugin = BubbleMenuPlugin({
      updateDelay,
      editor: menuEditor,
      element: e,
      pluginKey,
      shouldShow,
      tippyOptions,
    });

    menuEditor.registerPlugin(plugin);
    onCleanup(() => {
      menuEditor.unregisterPlugin(pluginKey);
    })
  });

  return (
    <div ref={setElement} class={props.class} style={{ visibility: "hidden" }}>
      {props.children}
    </div>
  );
};
