import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { cn } from "../../lib/utils";
import { Check, Trash } from "lucide-solid";
import { useEditor } from "novel";
import { createEffect, createSignal, Show } from "solid-js";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_e) {
    return false;
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (_e) {
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LinkSelector = (props: LinkSelectorProps) => {
  const [inputRef, setInputRef] = createSignal<HTMLInputElement>();
  const editor = useEditor();

  // Autofocus on input by default
  createEffect(() => {
    inputRef()?.focus();
  });

  return (
    <Show when={editor()}>
      <Popover modal={true} open={props.open} onOpenChange={props.onOpenChange}>
        <PopoverTrigger as={Button} size="sm" variant="ghost" class="gap-2 rounded-none border-none">
          <p class="text-base">↗</p>
          <p
            class={cn("underline decoration-stone-400 underline-offset-4", {
              "text-blue-500": editor()!.isActive("link"),
            })}
          >
            Link
          </p>
        </PopoverTrigger>
        <PopoverContent align="start" class="w-60 p-0" sideOffset={10}>
          <form
            onSubmit={(e) => {
              const target = e.currentTarget as HTMLFormElement;
              e.preventDefault();
              const input = target[0] as HTMLInputElement;
              const url = getUrlFromString(input.value);
              if (url) {
                editor()!.chain().focus().setLink({ href: url }).run();
                props.onOpenChange(false);
              }
            }}
            class="flex  p-1 "
          >
            <input
              ref={setInputRef}
              type="text"
              placeholder="Paste a link"
              class="flex-1 bg-background p-1 text-sm outline-hidden"
              value={editor()!.getAttributes("link").href || ""}
            />
            <Show when={editor()!.getAttributes("link").href} fallback={
              <Button size="icon" class="h-8">
                <Check class="h-4 w-4" />
              </Button>
            }>
              <Button
                size="icon"
                variant="outline"
                type="button"
                class="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
                onClick={() => {
                  editor()!.chain().focus().unsetLink().run();
                  inputRef()!.value = "";
                  props.onOpenChange(false);
                }}
              >
                <Trash class="h-4 w-4" />
              </Button>
            </Show>
          </form>
        </PopoverContent>
      </Popover>
    </Show>
  );
};
