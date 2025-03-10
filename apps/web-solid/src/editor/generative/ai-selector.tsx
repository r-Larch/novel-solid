import { Command, CommandInput, CommandList } from "../ui/command";

import { ArrowUp } from "lucide-solid";
import { useEditor } from "novel";
import { addAIHighlight } from "novel";
import { SolidMarkdown } from "solid-markdown";
import { toast } from "solid-sonner";
import { Button } from "../ui/button";
import CrazySpinner from "../ui/icons/crazy-spinner";
import Magic from "../ui/icons/magic";
import AICompletionCommands from "./ai-completion-command";
import AISelectorCommands from "./ai-selector-commands";
import { createEffect, createSignal, Show } from "solid-js";
import { useCompletion } from "./use-completion";
//TODO: I think it makes more sense to create a custom Tiptap extension for this functionality https://tiptap.dev/docs/editor/ai/introduction

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISelector(props: AISelectorProps) {
  const editor = useEditor();
  const [inputValue, setInputValue] = createSignal("");

  const llm = useCompletion({
    api: "/api/generate",
    onResponse: (response: any) => {
      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }
    },
    onError: (e: any) => {
      toast.error(e.message);
    },
  });

  const hasCompletion = () => llm.completion.length > 0;

  return (
    <Command class="w-[350px]">

      <Show when={hasCompletion()}>
        <div class="flex max-h-[400px]">
          <div class="overflow-auto">
            <div class="prose p-2 px-4 prose-sm">
              <SolidMarkdown>{llm.completion}</SolidMarkdown>
            </div>
          </div>
        </div>
      </Show>

      <Show when={llm.isLoading}>
        <div class="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Magic class="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div class="ml-2 mt-1">
            <CrazySpinner />
          </div>
        </div>
      </Show>

      <Show when={!llm.isLoading}>
        <div class="relative">
          <CommandInput
            ref={e => createEffect(() => e.focus())}
            value={inputValue()}
            onValueChange={setInputValue}
            autofocus
            placeholder={hasCompletion() ? "Tell AI what to do next" : "Ask AI to edit or generate..."}
            onFocus={() => addAIHighlight(editor()!)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                props.onOpenChange(false);
              }
            }}
          />
          <Button
            size="icon"
            class="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-purple-500 hover:bg-purple-900"
            onClick={() => {
              if (llm.completion) {
                return llm.complete(llm.completion, {
                  body: { option: "zap", command: inputValue },
                }).then(() => setInputValue(""));
              }

              const slice = editor()!.state.selection.content();
              const text = editor()!.storage.markdown.serializer.serialize(slice.content);

              llm.complete(text, {
                body: { option: "zap", command: inputValue },
              }).then(() => setInputValue(""));
            }}
          >
            <ArrowUp class="h-4 w-4" />
          </Button>
        </div>

        <CommandList>
          <Show when={hasCompletion()} fallback={
            <AISelectorCommands onSelect={(value, option) => llm.complete(value, { body: { option } })} />
          }>
            <AICompletionCommands
              onDiscard={() => {
                editor()!.chain().unsetHighlight().focus().run();
                console.log('discard')
                props.onOpenChange(false);
              }}
              completion={llm.completion}
            />
          </Show>
        </CommandList>

      </Show>

    </Command>
  );
}
