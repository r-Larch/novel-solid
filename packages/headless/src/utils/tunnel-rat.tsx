import { type Component, type Context, For, type JSX, createContext, createMemo, createRenderEffect, on, onCleanup, onMount, useContext } from "solid-js";
import { createStore } from "solid-js/store";

type Props = { children: JSX.Element };

type State = {
  current: Slot[];
  version: number;
};

type Slot = {
  children: JSX.Element;
}

export default function tunnel() {
  const [store, setStore] = createStore<State>({
    current: [],
    version: 0,
  });

  return {
    In: (props: Props): JSX.Element => {
      const children = createMemo(() => props.children);

      /* When this component mounts, we increase the store's version number.
      This will cause all existing rats to re-render (just like if the Out component
      were mapping items to a list.) The re-rendering will cause the final 
      order of rendered components to match what the user is expecting. */
      onMount(() => {
        setStore((state) => ({
          version: state.version + 1,
        }));
      });

      /* Any time the children _or_ the store's version number change, insert
      the specified children into the list of rats. */
      createRenderEffect(
        on([children, () => store.version], ([children]) => {
          const slot: Slot = {
            children,
          };

          setStore((x) => ({
            current: [...x.current, slot],
          }));

          onCleanup(() =>
            setStore((x) => ({
              current: x.current.filter((x) => x !== slot),
            })),
          );
        }),
      );

      return undefined;
    },

    Out: () => {
      return <For each={store.current}>{(x) => <>{x.children}</>}</For>;
    },
  };
}

export type EditorCommandTunnelContext = ReturnType<typeof tunnel>;
export const EditorCommandTunnelContext = createContext(
  {} as EditorCommandTunnelContext,
) as Context<EditorCommandTunnelContext> & {
  Consumer: Component<{
    children: (context: EditorCommandTunnelContext) => JSX.Element;
  }>;
};

EditorCommandTunnelContext.Consumer = (props) => {
  const context = useContext(EditorCommandTunnelContext);
  return props.children(context);
};
