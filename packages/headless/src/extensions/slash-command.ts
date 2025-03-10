import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import Suggestion, {
  type SuggestionKeyDownProps,
  type SuggestionOptions,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { SolidRenderer } from "@tiptap/solid";
import type { Accessor, ValidComponent } from "solid-js";
import tippy, { type GetReferenceClientRect, type Instance, type Props } from "tippy.js";
import { EditorCommandOut } from "../components/editor-command";

const Command = Extension.create({
  name: "slash-command",
  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
      } as SuggestionOptions,
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

type RenderFunction<I, TSelected> = NonNullable<SuggestionOptions<I, TSelected>["render"]>

const renderItems = <I = any, TSelected = any>(): ReturnType<RenderFunction<I, TSelected>> => {
  let component: SolidRenderer<SuggestionProps<I, TSelected>> | null = null;
  let popup: Instance<Props>[] | null = null;

  return {
    onStart: (props: SuggestionProps<I, TSelected>) => {
      component = new SolidRenderer<SuggestionProps<I, TSelected>>(EditorCommandOut, {
        props,
        editor: props.editor,
      });

      const { selection } = props.editor.state;

      const parentNode = selection.$from.node(selection.$from.depth);
      const blockType = parentNode.type.name;

      if (blockType === "codeBlock") {
        return;
      }

      popup = tippy("body", {
        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "bottom-start",
      });
    },

    onUpdate: (props: SuggestionProps<I, TSelected>) => {
      component?.updateProps(props);

      popup?.[0]?.setProps({
        getReferenceClientRect: props.clientRect as GetReferenceClientRect,
      });
    },

    onKeyDown: (props: SuggestionKeyDownProps) => {
      if (props.event.key === "Escape") {
        popup?.[0]?.hide();

        return true;
      }

      return false
    },

    onExit: () => {
      popup?.[0]?.destroy();
      component?.destroy();
    },
  };
};

export interface SuggestionItem {
  title: string;
  description: string;
  icon: ValidComponent;
  searchTerms?: string[];
  command?: (props: { editor: Editor; range: Range }) => void;
}

export const createSuggestionItems = (items: SuggestionItem[]) => items;

export const handleCommandNavigation = (event: KeyboardEvent) => {
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    const slashCommand = document.querySelector("#slash-command");
    if (slashCommand) {
      return true;
    }
  }
};

export { Command, renderItems };
