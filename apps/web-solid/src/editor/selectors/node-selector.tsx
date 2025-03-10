import {
  Check,
  CheckSquare,
  ChevronDown,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ListOrdered,
  type LucideIcon,
  TextIcon,
  TextQuote,
} from "lucide-solid";
import { EditorBubbleItem, EditorInstance, useEditor } from "novel";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { createMemo, For, Show } from "solid-js";
import { createEditorState } from "../../../../../packages/tiptap-solid/dist";

export type SelectorItem = {
  name: string;
  icon: LucideIcon;
  command: (editor: EditorInstance) => void;
  isActive: (editor: EditorInstance) => boolean;
};

const items: SelectorItem[] = [
  {
    name: "Text",
    icon: TextIcon,
    command: (editor) => editor.chain().focus().clearNodes().run(),
    // I feel like there has to be a more efficient way to do this – feel free to PR if you know how!
    isActive: (editor) =>
      editor.isActive("paragraph") && !editor.isActive("bulletList") && !editor.isActive("orderedList"),
  },
  {
    name: "Heading 1",
    icon: Heading1,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 1 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 1 }),
  },
  {
    name: "Heading 2",
    icon: Heading2,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 2 }),
  },
  {
    name: "Heading 3",
    icon: Heading3,
    command: (editor) => editor.chain().focus().clearNodes().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive("heading", { level: 3 }),
  },
  {
    name: "To-do List",
    icon: CheckSquare,
    command: (editor) => editor.chain().focus().clearNodes().toggleTaskList().run(),
    isActive: (editor) => editor.isActive("taskItem"),
  },
  {
    name: "Bullet List",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().clearNodes().toggleBulletList().run(),
    isActive: (editor) => editor.isActive("bulletList"),
  },
  {
    name: "Numbered List",
    icon: ListOrdered,
    command: (editor) => editor.chain().focus().clearNodes().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive("orderedList"),
  },
  {
    name: "Quote",
    icon: TextQuote,
    command: (editor) => editor.chain().focus().clearNodes().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive("blockquote"),
  },
  {
    name: "Code",
    icon: Code,
    command: (editor) => editor.chain().focus().clearNodes().toggleCodeBlock().run(),
    isActive: (editor) => editor.isActive("codeBlock"),
  },
];

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = (props: NodeSelectorProps) => {
  const editor = useEditor();
  const activeItem = createMemo(() => items.find((item) => item.isActive(editor()!)) ?? { name: "Multiple" });

  return (
    <Show when={editor()}>
      <Popover modal={true} open={props.open} onOpenChange={props.onOpenChange}>
        <PopoverTrigger as={Button} size="sm" variant="ghost" class="gap-2 rounded-none border-none hover:bg-accent focus:ring-0">
          <span class="whitespace-nowrap text-sm">{activeItem().name}</span>
          <ChevronDown class="h-4 w-4" />
        </PopoverTrigger>
        <PopoverContent sideOffset={5} align="start" class="w-48 p-1">
          <For each={items}>{item =>
            <EditorBubbleItem
              onSelect={(editor) => {
                item.command(editor);
                props.onOpenChange(false);
              }}
              class="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
            >
              <div class="flex items-center space-x-2">
                <div class="rounded-sm border border-current/20 p-1">
                  <item.icon class="h-3 w-3" />
                </div>
                <span>{item.name}</span>
              </div>
              {activeItem().name === item.name && <Check class="h-4 w-4" />}
            </EditorBubbleItem>
          }</For>
        </PopoverContent>
      </Popover>
    </Show>
  );
};
