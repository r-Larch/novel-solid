import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import { AISelector } from "./ai-selector";
import { createEffect, JSX, Show } from "solid-js";

interface GenerativeMenuSwitchProps {
  children: JSX.Element;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const GenerativeMenuSwitch = (props: GenerativeMenuSwitchProps) => {
  const editor = useEditor();

  createEffect(() => {
    if (!props.open && editor()) removeAIHighlight(editor()!);
  });

  return (
    <EditorBubble
      tippyOptions={{
        placement: props.open ? "bottom-start" : "top",
        onHidden: () => {
          props.onOpenChange(false);
          editor()!.chain().unsetHighlight().run();
        },
      }}
      class="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-muted bg-background shadow-xl"
    >
      <Show when={props.open}
        fallback={
          <>
            <Button
              class="gap-1 rounded-none text-purple-500"
              variant="ghost"
              onClick={() => props.onOpenChange(true)}
              size="sm"
            >
              <Magic class="h-5 w-5" />
              Ask AI
            </Button>
            {props.children}
          </>
        }>
        <AISelector open={props.open} onOpenChange={props.onOpenChange} />
      </Show>
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
