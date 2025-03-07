import type { Editor } from "@tiptap/core";
import type { Owner } from "solid-js";

export const ReactiveOwnerProperty = Symbol("Reactive owner property used by tiptap solid as a workaround");

export const getTiptapSolidReactiveOwner = (editor: Editor): Owner | undefined => (editor as any)[ReactiveOwnerProperty] ?? undefined;

export const setTiptapSolidReactiveOwner = (editor: Editor, owner: Owner | null) => {
  (editor as any)[ReactiveOwnerProperty] = owner;
};
