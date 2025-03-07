import { type Accessor, createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";


export function useSyncExternalStore<Snapshot>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot?: null | (() => Snapshot),
): Accessor<Snapshot> {
  const snapshotAccessor = () => {
    const accessor = isServer ? getServerSnapshot : getSnapshot;
    if (!accessor) throw new Error("getServerSnapshot or getSnapshot was not provided!");
    return accessor();
  };

  const [snapshot, setSnapshot] = createSignal<Snapshot>(snapshotAccessor());

  createEffect(() => {
    const dispose = subscribe(reload);
    onCleanup(dispose);
  });

  function reload() {
    const snapshot = snapshotAccessor();
    setSnapshot(() => snapshot);
  }

  return snapshot;
}

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => Snapshot,
  getServerSnapshot: undefined | null | (() => Snapshot),
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Accessor<Selection> {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const selection = createMemo(
    () => {
      const snapshot = store();
      return selector(snapshot);
    },
    undefined,
    { equals: isEqual },
  );

  return selection;
}
