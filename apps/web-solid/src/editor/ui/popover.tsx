import { mergeRefs } from "@solid-primitives/refs";
import { cn } from "../../lib/utils";
import { batch, Component, createContext, createEffect, createSignal, createUniqueId, JSX, onCleanup, splitProps } from "solid-js";
import { useContext } from "solid-js";
import { Dynamic } from "solid-js/web";


type PopoverProps = {
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: JSX.Element;
}

const Popover = (props: PopoverProps) => {
  const [store, actions] = createPopoverContext();
  return (
    <PopoverContext.Provider value={[store, actions]}>
      {props.children}
    </PopoverContext.Provider>
  )
};


type PopoverTriggerProps<E extends DomElement = 'div'> = DomElementAsProps<E, {
  class?: string;
  children?: JSX.Element;
}>

function PopoverTrigger<E extends DomElement = 'div'>(props: PopoverTriggerProps<E>) {
  const [store, actions] = usePopoverContext();
  return (
    <Dynamic
      {...props}
      component={props.as ?? 'div'}
      ref={mergeRefs(props.ref, actions.triggerRef)}
      aria-details={store.dialogId}
      aria-expanded={store.open}
      aria-controls={store.dialogId}
    >
      {props.children}
    </Dynamic>
  )
};


type PopoverContentProps = {
  class?: string;
  align?: string;
  sideOffset?: number;
  children?: JSX.Element;
}

const PopoverContent = (props: PopoverContentProps) => {
  const [store, actions] = usePopoverContext();
  const [_, rest] = splitProps(props, ['class', 'align', 'sideOffset'])

  return (
    <BasePopover id={store.dialogId}
      open={store.open}
      onOpenChange={actions.setOpen}
      source={store.trigger}
      //align={props.align ?? "center"}
      //sideOffset={props.sideOffset ?? 4}
      class={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        props.class,
      )}
      {...rest}
    />
  )
};

export { Popover, PopoverTrigger, PopoverContent };



type BasePopoverProps = Omit<JSX.IntrinsicElements['dialog'], 'onToggle' | 'popover'> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mode?: "manual" | "auto";
  source?: HTMLElement;
}

export function BasePopover(props: BasePopoverProps) {
  let e!: HTMLDialogElement & { showPopover(o?: { source?: HTMLElement }): void; };

  createEffect(() => {
    if (props.open) e.showPopover({ source: props.source })
    else e.hidePopover()
  })

  const [_, rest] = splitProps(props, ['ref', 'mode', 'open', 'onOpenChange'])

  return (
    <dialog
      ref={mergeRefs(e, props.ref)}
      popover={props.mode ?? 'auto'}
      onToggle={e => props.onOpenChange?.(e.newState === 'open')}
      {...rest}
    >
      {props.children}
    </dialog>
  )
}


function createPopoverContext() {
  const [open, setOpen] = createSignal<boolean>(false);
  const [rect, setRect] = createSignal<DOMRect>();
  const [trigger, setTrigger] = createSignal<HTMLElement>();

  const store = {
    dialogId: createUniqueId(),
    triggerId: createUniqueId(),
    get open() { return open() },
    get trigger() { return trigger() },
    get rect() { return rect() },
  }

  const actions = {
    triggerRef(trigger: HTMLElement) {
      setTrigger(trigger);
      const handler = (e: MouseEvent) => {
        e.preventDefault();
        const rect = trigger.getBoundingClientRect();
        batch(() => {
          setRect(rect);
          setOpen(_ => !_);
        })
      };
      trigger.addEventListener('click', handler)
      onCleanup(() => trigger.removeEventListener('click', handler))
    },
    setOpen,
  }

  return [store, actions] as const;
}


type PopoverContext = ReturnType<typeof createPopoverContext>;
const PopoverContext = createContext<PopoverContext>();
const usePopoverContext = () => useContext(PopoverContext)!;


export type DomElement = (keyof JSX.IntrinsicElements) | Component<any>
export type DomElementProps<T extends DomElement> = T extends Component<infer P> ? P : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] : never
export type DomElementAsProps<T extends DomElement, Props = {}> = Omit<DomElementProps<T>, 'as' | keyof Props> & { as?: T; } & Props
export type DomElementRef<T extends DomElement> = T extends Component ? T : T extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[T] extends JSX.DOMAttributes<infer E> ? E : never : never;
