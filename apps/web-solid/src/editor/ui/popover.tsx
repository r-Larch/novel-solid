import { mergeRefs } from "@solid-primitives/refs";
import { cn } from "../../lib/utils";
import { batch, Component, createContext, createEffect, createSignal, createUniqueId, JSX, onCleanup, splitProps } from "solid-js";
import { useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import './Popover.css';
import { createParameterSignal } from "../utils";


type PopoverProps = {
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: JSX.Element;
}

const Popover = (props: PopoverProps) => {
  const [store, actions] = createPopoverContext(props);
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

  const offset = () => props.sideOffset ?? 4;

  return (
    <BasePopover id={store.dialogId}
      open={store.open}
      onOpenChange={actions.setOpen}
      //source={store.trigger}
      //align={props.align ?? "center"}
      //sideOffset={props.sideOffset ?? 4}
      class={cn(
        "transition-popover",
        "z-50 w-72 rounded-md bg-novel-popover p-4 text-novel-popover-foreground shadow-md outline-hidden",
        props.class,
      )}
      style={{
        'left': store.rect?.left + 'px',
        'top': `${store.rect?.top! + store.rect?.height! + offset()}px`,
        'margin': 0,
      }}
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
  let ref!: HTMLDialogElement & { showPopover(o?: { source: HTMLElement }): void; };

  createEffect(() => {
    if (props.open) ref.showPopover(props.source ? { source: props.source } : undefined)
    else ref.hidePopover()
  })

  const [_, rest] = splitProps(props, ['ref', 'open', 'onOpenChange', 'mode', 'source'])

  return (
    <dialog
      ref={mergeRefs(e => (ref = e), props.ref)}
      popover={props.mode ?? 'auto'}
      onToggle={e => props.onOpenChange?.(e.newState === 'open')}
      {...rest}
    >
      {props.children}
    </dialog>
  )
}

type PopoverContextProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function createPopoverContext(props: PopoverContextProps) {
  const [open, setOpen] = createParameterSignal(() => !!props.open, open => props.onOpenChange?.(open));
  const [rect, setRect] = createSignal<DOMRect>(new DOMRect(0, 0, 0, 0));
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

      setRect(trigger.getBoundingClientRect());
      let id = requestAnimationFrame(function loop() {
        setRect(trigger.getBoundingClientRect());
        id = requestAnimationFrame(loop);
      })

      trigger.addEventListener('click', handler)
      onCleanup(() => {
        trigger.removeEventListener('click', handler);
        cancelAnimationFrame(id);
      })
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
