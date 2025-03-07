import { ArrowDownWideNarrow, CheckCheck, RefreshCcwDot, StepForward, WrapText } from "lucide-solid";
import { getPrevText, useEditor } from "novel";
import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";
import { For } from "solid-js";

const options = [
  {
    value: "improve",
    label: "Improve writing",
    icon: RefreshCcwDot,
  },
  {
    value: "fix",
    label: "Fix grammar",
    icon: CheckCheck,
  },
  {
    value: "shorter",
    label: "Make shorter",
    icon: ArrowDownWideNarrow,
  },
  {
    value: "longer",
    label: "Make longer",
    icon: WrapText,
  },
];

interface AISelectorCommandsProps {
  onSelect: (value: string, option: string) => void;
}

const AISelectorCommands = (props: AISelectorCommandsProps) => {
  const editor = useEditor();

  return (
    <>
      <CommandGroup heading="Edit or review selection">
        <For each={options}>{option =>
          <CommandItem
            onSelect={(value) => {
              const slice = editor()!.state.selection.content();
              const text = editor()!.storage.markdown.serializer.serialize(slice.content);
              props.onSelect(text, value);
            }}
            class="flex gap-2 px-4"
            value={option.value}
          >
            <option.icon class="h-4 w-4 text-purple-500" />
            {option.label}
          </CommandItem>
        }</For>
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Use AI to do more">
        <CommandItem
          onSelect={() => {
            const pos = editor()!.state.selection.from;
            const text = getPrevText(editor()!, pos);
            props.onSelect(text, "continue");
          }}
          value="continue"
          class="gap-2 px-4"
        >
          <StepForward class="h-4 w-4 text-purple-500" />
          Continue writing
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AISelectorCommands;
