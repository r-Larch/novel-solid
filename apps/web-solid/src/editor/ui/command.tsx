import { Command as CommandPrimitive } from "cmdk-solid";

import Magic from "./icons/magic";
import { cn } from "./../../lib/utils";
import { ComponentProps, JSX } from "solid-js";

const Command = (props: ComponentProps<typeof CommandPrimitive>) => (
  <CommandPrimitive
    {...props}
    class={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-novel-popover text-novel-popover-foreground",
      props.class,
    )}
  />
);

const CommandInput = (props: ComponentProps<typeof CommandPrimitive.Input>) => (
  <div class="flex items-center border-b border-novel-border px-4" cmdk-input-wrapper="">
    <Magic class="mr-2 h-4 w-4 shrink-0 text-purple-500" />
    <CommandPrimitive.Input
      {...props}
      class={cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-novel-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        props.class,
      )}
    />
  </div>
);

const CommandList = (props: ComponentProps<typeof CommandPrimitive.List>) => (
  <CommandPrimitive.List
    {...props}
    class={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", props.class)}
  />
);

const CommandEmpty = (props: ComponentProps<typeof CommandPrimitive.Empty>) => (
  <CommandPrimitive.Empty {...props} class="py-6 text-center text-sm" />
);

const CommandGroup = (props: ComponentProps<typeof CommandPrimitive.Group>) => (
  <CommandPrimitive.Group
    {...props}
    class={cn(
      "overflow-hidden p-1 text-novel-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-novel-muted-foreground",
      props.class,
    )}
  />
);

const CommandSeparator = (props: ComponentProps<typeof CommandPrimitive.Separator>) => (
  <CommandPrimitive.Separator {...props} class={cn("-mx-1 h-[0.5px] bg-novel-border antialiased transform-gpu", props.class)} />
);

const CommandItem = (props: ComponentProps<typeof CommandPrimitive.Item>) => (
  <CommandPrimitive.Item
    {...props}
    class={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden aria-selected:bg-novel-accent aria-selected:text-novel-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
      props.class,
    )}
  />
);


const CommandShortcut = (props: JSX.IntrinsicElements['span']) => {
  return <span  {...props} class={cn("ml-auto text-xs tracking-widest text-novel-muted-foreground", props.class)} />;
};


export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
