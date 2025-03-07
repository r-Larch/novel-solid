import { FloatingMenuPlugin, type FloatingMenuPluginProps } from "@tiptap/extension-floating-menu";

import { type JSX, createEffect, createSignal, onCleanup } from "solid-js";
import { useCurrentEditor } from "./Context.js";

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export type FloatingMenuProps = Omit<Optional<FloatingMenuPluginProps, "pluginKey">, "element" | "editor"> & {
  editor: FloatingMenuPluginProps["editor"] | undefined;
  class?: string;
  children: JSX.Element;
};

export const FloatingMenu = (props: FloatingMenuProps) => {
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

    const { pluginKey = "floatingMenu", editor, tippyOptions = {}, shouldShow = null } = props;

    const menuEditor = editor || currentEditor();

    if (!menuEditor) {
      console.warn(
        "FloatingMenu component is not rendered inside of an editor component or does not have editor prop.",
      );
      return;
    }

    const plugin = FloatingMenuPlugin({
      pluginKey,
      editor: menuEditor,
      element: e,
      tippyOptions,
      shouldShow,
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
