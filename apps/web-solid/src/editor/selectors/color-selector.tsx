import { Check, ChevronDown } from "lucide-solid";
import { EditorBubbleItem, useEditor } from "novel";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Show } from "solid-js";
import { createParameterSignal } from "../utils";

export interface BubbleColorMenuItem {
  name: string;
  color: string;
}

const TEXT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-black)",
  },
  {
    name: "Purple",
    color: "#9333EA",
  },
  {
    name: "Red",
    color: "#E00000",
  },
  {
    name: "Yellow",
    color: "#EAB308",
  },
  {
    name: "Blue",
    color: "#2563EB",
  },
  {
    name: "Green",
    color: "#008A00",
  },
  {
    name: "Orange",
    color: "#FFA500",
  },
  {
    name: "Pink",
    color: "#BA4081",
  },
  {
    name: "Gray",
    color: "#A8A29E",
  },
];

const HIGHLIGHT_COLORS: BubbleColorMenuItem[] = [
  {
    name: "Default",
    color: "var(--novel-highlight-default)",
  },
  {
    name: "Purple",
    color: "var(--novel-highlight-purple)",
  },
  {
    name: "Red",
    color: "var(--novel-highlight-red)",
  },
  {
    name: "Yellow",
    color: "var(--novel-highlight-yellow)",
  },
  {
    name: "Blue",
    color: "var(--novel-highlight-blue)",
  },
  {
    name: "Green",
    color: "var(--novel-highlight-green)",
  },
  {
    name: "Orange",
    color: "var(--novel-highlight-orange)",
  },
  {
    name: "Pink",
    color: "var(--novel-highlight-pink)",
  },
  {
    name: "Gray",
    color: "var(--novel-highlight-gray)",
  },
];

interface ColorSelectorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ColorSelector = (props: ColorSelectorProps) => {
  const [open, setOpen] = createParameterSignal(() => !!props.open, open => props.onOpenChange?.(open));

  const editor = useEditor();

  const activeColorItem = () => TEXT_COLORS.find(({ color }) => editor()!.isActive("textStyle", { color }));

  const activeHighlightItem = () => HIGHLIGHT_COLORS.find(({ color }) => editor()!.isActive("highlight", { color }));

  return (
    <Show when={editor()}>
      <Popover modal={true} open={open()} onOpenChange={setOpen}>
        <PopoverTrigger as={Button} size="sm" class="gap-2 rounded-none" variant="ghost">
          <span
            class="rounded-sm px-1"
            style={{
              color: activeColorItem()?.color,
              "background-color": activeHighlightItem()?.color,
            }}
          >
            A
          </span>
          <ChevronDown class="h-4 w-4" />
        </PopoverTrigger>

        <PopoverContent
          sideOffset={5}
          class="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl "
          align="start"
        >
          <div class="flex flex-col">
            <div class="my-1 px-2 text-sm font-semibold text-muted-foreground">Color</div>
            {TEXT_COLORS.map(({ name, color }) => (
              <EditorBubbleItem
                as='button'
                onSelect={() => {
                  editor()!.commands.unsetColor();
                  name !== "Default" &&
                    editor()!
                      .chain()
                      .focus()
                      .setColor(color || "")
                      .run();
                  setOpen(false);
                }}
                class="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent focus:bg-accent focus:outline-1 focus:outline-blue-200"
              >
                <div class="flex items-center gap-2">
                  <div class="rounded-sm border px-2 py-px font-medium" style={{ color }}>
                    A
                  </div>
                  <span>{name}</span>
                </div>
              </EditorBubbleItem>
            ))}
          </div>
          <div class="flex flex-col">
            <div class="my-1 px-2 text-sm font-semibold text-muted-foreground">Background</div>
            {HIGHLIGHT_COLORS.map(({ name, color }) => (
              <EditorBubbleItem
                as="button"
                onSelect={() => {
                  editor()!.commands.unsetHighlight();
                  name !== "Default" && editor()!.chain().focus().setHighlight({ color }).run();
                  setOpen(false);
                }}
                class="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent focus:bg-accent focus:outline-1 focus:outline-blue-200"
              >
                <div class="flex items-center gap-2">
                  <div class="rounded-sm border px-2 py-px font-medium" style={{ "background-color": color }}>
                    A
                  </div>
                  <span>{name}</span>
                </div>
                {editor()!.isActive("highlight", { color }) && <Check class="h-4 w-4" />}
              </EditorBubbleItem>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </Show>
  );
};
