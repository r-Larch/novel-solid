import { CommandGroup, CommandItem, CommandSeparator } from "../ui/command";
import { addAIHighlight, useEditor } from "novel";
import { Check, TextQuote, TrashIcon } from "lucide-solid";

type AICompletionCommandsProps = {
  completion: string;
  onDiscard: () => void;
}

const AICompletionCommands = (props: AICompletionCommandsProps) => {
  const editor = useEditor();
  return (
    <>
      <CommandGroup>
        <CommandItem
          class="gap-2 px-4"
          value="replace"
          onSelect={() => {
            const selection = editor()!.view.state.selection;
            editor()!
              .chain()
              .focus()
              .insertContentAt(
                {
                  from: selection.from,
                  to: selection.to,
                },
                props.completion,
                { updateSelection: true }
              )
              .run();
          }}
        >
          <Check class="h-4 w-4 text-novel-muted-foreground" />
          Replace selection
        </CommandItem>

        <CommandItem
          class="gap-2 px-4"
          value="insert"
          onSelect={() => {
            const selection = editor()!.view.state.selection;
            editor()!
              .chain()
              .focus()
              .insertContentAt(selection.to + 1, props.completion, { updateSelection: true })
              .run();
            addAIHighlight(editor()!);
          }}
        >
          <TextQuote class="h-4 w-4 text-novel-muted-foreground" />
          Insert below
        </CommandItem>
      </CommandGroup>

      <CommandSeparator />

      <CommandGroup>
        <CommandItem onSelect={props.onDiscard} value="trash" class="gap-2 px-4">
          <TrashIcon class="h-4 w-4 text-novel-muted-foreground" />
          Discard
        </CommandItem>
      </CommandGroup>
    </>
  );
};

export default AICompletionCommands;
