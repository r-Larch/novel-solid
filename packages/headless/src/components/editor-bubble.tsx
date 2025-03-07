import { isNodeSelection } from "@tiptap/core";
import { useCurrentEditor } from "@tiptap/solid";
import { BubbleMenu, type BubbleMenuProps } from "@tiptap/solid";
import { type JSX, type Ref, Show, createEffect, createMemo, createSignal, splitProps } from "solid-js";
import type { Instance, Props } from "tippy.js";

export interface EditorBubbleProps extends Omit<BubbleMenuProps, "editor" | "ref"> {
  readonly ref?: Ref<HTMLDivElement>;
  readonly children: JSX.Element;
}

export const EditorBubble = (props: EditorBubbleProps) => {
  const currentEditor = useCurrentEditor();
  let [instance, setInstance] = createSignal<Instance<Props>>();

  const [_, rest] = splitProps(props, ["children", "tippyOptions"]);

  createEffect(() => {
    const inst = instance();
    if (inst && props.tippyOptions?.placement) {
      inst.setProps({ placement: props.tippyOptions.placement });
      inst.popperInstance?.update();
    }
  });

  const bubbleMenuProps = createMemo((): Omit<BubbleMenuProps, "children"> => {
    const shouldShow: BubbleMenuProps["shouldShow"] = ({ editor, state }) => {
      const { selection } = state;
      const { empty } = selection;

      // don't show bubble menu if:
      // - the editor is not editable
      // - the selected node is an image
      // - the selection is empty
      // - the selection is a node selection (for drag handles)
      if (!editor.isEditable || editor.isActive("image") || empty || isNodeSelection(selection)) {
        return false;
      }
      return true;
    };

    return {
      shouldShow,
      tippyOptions: {
        onCreate: (instance: Instance<Props>) => {
          setInstance(instance);

          instance.popper.firstChild?.addEventListener("blur", (event: Event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
          });
        },
        moveTransition: "transform 0.15s ease-out",
        ...props.tippyOptions,
      },
      editor: currentEditor(),
      ...rest,
    };
  });

  return (
    // We need to add this because of https://github.com/ueberdosis/tiptap/issues/2658
    <Show when={currentEditor()}>
      <div ref={props.ref}>
        <BubbleMenu {...bubbleMenuProps()}>{props.children}</BubbleMenu>
      </div>
    </Show>
  );
};

export default EditorBubble;
