import type { Range } from "@tiptap/core";
import { createRoot, type ParentProps } from "solid-js";
import { createStore } from "solid-js/store";

type NovelStore = {
  query?: string;
  range?: Range;
}

const [store, dispose] = createRoot((dispose) => {
  return [createStore<NovelStore>({}), dispose]
});

/**
 * Access the novel store globaly.
 */
export const useNovelStore = () => {
  return store;
};

export const NovelStoreProvider = (props: ParentProps) => {
  const [novel, setNovel] = useNovelStore();
  setNovel({ query: undefined, range: undefined })
  return (
    <>{props.children}</>
  )
}
