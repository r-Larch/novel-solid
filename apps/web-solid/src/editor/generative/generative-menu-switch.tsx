import { EditorBubble, removeAIHighlight, useEditor } from "novel";
import { Button } from "../ui/button";
import Magic from "../ui/icons/magic";
import { AISelector } from "./ai-selector";
import { createEffect, JSX, Show } from "solid-js";
import { createParameterSignal } from "../utils";

interface GenerativeMenuSwitchProps {
  children: JSX.Element;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
const GenerativeMenuSwitch = (props: GenerativeMenuSwitchProps) => {
  const editor = useEditor();
  const [open, setOpen] = createParameterSignal(() => !!props.open, open => props.onOpenChange?.(open));

  createEffect(() => {
    if (!open() && editor()) removeAIHighlight(editor()!);
  });

  return (
    <EditorBubble
      tippyOptions={{
        placement: open() ? "bottom-start" : "top",
        maxWidth: 'none',
        onHidden: () => {
          setOpen(false);
          editor()!.chain().unsetHighlight().run();
        },
      }}
      class="flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-novel-muted bg-novel-background shadow-xl"
    >
      <Show when={open()}
        fallback={
          <>
            <Button
              class="gap-1 rounded-none text-white bg-purple-600 hover:bg-purple-700 hover:text-white"
              variant="ghost"
              onClick={() => setOpen(true)}
              size="sm"
            >
              <Magic class="h-5 w-5" />
              Ask AI
            </Button>
            {props.children}
          </>
        }>
        <AISelector open={open()} onOpenChange={setOpen} />
      </Show>
    </EditorBubble>
  );
};

export default GenerativeMenuSwitch;
