import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { SigmaIcon } from "lucide-solid";
import { useEditor } from "novel";
import { Show } from "solid-js";

export const MathSelector = () => {
  const editor = useEditor();
  return (
    <Show when={editor()}>
      <Button
        variant="ghost"
        size="sm"
        class="rounded-none w-12"
        onClick={(evt) => {
          const e = editor()!;
          if (e.isActive("math")) {
            e.chain().focus().unsetLatex().run();
          } else {
            const { from, to } = e.state.selection;
            const latex = e.state.doc.textBetween(from, to);

            if (!latex) return;

            e.chain().focus().setLatex({ latex }).run();
          }
        }}
      >
        <SigmaIcon
          class={cn("size-4", { "text-blue-500": editor()!.isActive("math") })}
          strokeWidth={2.3}
        />
      </Button>
    </Show>
  );
};
