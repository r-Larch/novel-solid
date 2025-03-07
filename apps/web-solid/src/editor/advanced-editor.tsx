import { defaultEditorContent } from "../lib/content";
import {
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  type EditorInstance,
  EditorRoot,
  type JSONContent,
  handleCommandNavigation,
  handleImageDrop,
  handleImagePaste,
} from "novel";
import { createSignal, For, onMount, Show } from "solid-js";
import { defaultExtensions } from "./extensions";
import { ColorSelector } from "./selectors/color-selector";
import { LinkSelector } from "./selectors/link-selector";
import { MathSelector } from "./selectors/math-selector";
import { NodeSelector } from "./selectors/node-selector";
import { Separator } from "./ui/separator";

import GenerativeMenuSwitch from "./generative/generative-menu-switch";
import { uploadFn } from "./image-upload";
import { TextButtons } from "./selectors/text-buttons";
import { slashCommand, suggestionItems } from "./slash-command";
import { debounce } from "@solid-primitives/scheduled";
import { Dynamic } from "solid-js/web";
import hljs from "highlight.js";

const extensions = [...defaultExtensions, slashCommand];

const TailwindAdvancedEditor = () => {
  const [initialContent, setInitialContent] = createSignal<JSONContent>();
  const [saveStatus, setSaveStatus] = createSignal("Saved");
  const [charsCount, setCharsCount] = createSignal<number>(0);

  const [openNode, setOpenNode] = createSignal(false);
  const [openColor, setOpenColor] = createSignal(false);
  const [openLink, setOpenLink] = createSignal(false);
  const [openAI, setOpenAI] = createSignal(false);

  //Apply Codeblock Highlighting on the HTML from editor.getHTML()
  const highlightCodeblocks = (content: string) => {
    const doc = new DOMParser().parseFromString(content, "text/html");
    doc.querySelectorAll<HTMLElement>("pre code").forEach((el) => {
      // https://highlightjs.readthedocs.io/en/latest/api.html?highlight=highlightElement#highlightelement
      hljs.highlightElement(el);
    });
    return new XMLSerializer().serializeToString(doc);
  };

  const debouncedUpdates = debounce((editor: EditorInstance) => {
    const json = editor.getJSON();
    setCharsCount(editor.storage.characterCount.words());
    window.localStorage.setItem("html-content", highlightCodeblocks(editor.getHTML()));
    window.localStorage.setItem("novel-content", JSON.stringify(json));
    window.localStorage.setItem("markdown", editor.storage.markdown.getMarkdown());
    setSaveStatus("Saved");
  }, 500);

  onMount(() => {
    setInitialContent(defaultEditorContent);
  });

  return (
    <Show when={initialContent()}>
      <div class="relative w-full max-w-screen-lg">
        <div class="flex absolute right-5 top-5 z-10 mb-5 gap-2">
          <div class="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">{saveStatus()}</div>
          <div class={charsCount() ? "rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground" : "hidden"}>
            {charsCount()} Words
          </div>
        </div>
        <EditorRoot>
          <EditorContent
            initialContent={initialContent()}
            extensions={extensions}
            class="relative min-h-[500px] w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
            editorProps={{
              handleDOMEvents: {
                keydown: (_view, event) => handleCommandNavigation(event),
              },
              handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
              handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
              attributes: {
                class:
                  "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
              },
            }}
            onUpdate={({ editor }) => {
              debouncedUpdates(editor);
              setSaveStatus("Unsaved");
            }}
          >
            <EditorCommand class="z-50 h-auto max-h-[330px] overflow-y-auto rounded-md border border-muted bg-background px-1 py-2 shadow-md transition-all">
              <EditorCommandEmpty class="px-2 text-muted-foreground">No results</EditorCommandEmpty>
              <EditorCommandList>
                <For each={suggestionItems}>{item =>
                  <EditorCommandItem
                    value={item.title}
                    onCommand={(val) => item.command?.(val)}
                    class="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent aria-selected:bg-accent"
                  >
                    <div class="flex h-10 w-10 items-center justify-center rounded-md border border-muted bg-background">
                      <Dynamic component={item.icon} />
                    </div>
                    <div>
                      <p class="font-medium">{item.title}</p>
                      <p class="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </EditorCommandItem>
                }</For>
              </EditorCommandList>
            </EditorCommand>

            <GenerativeMenuSwitch open={openAI()} onOpenChange={setOpenAI}>
              <Separator orientation="vertical" />
              <NodeSelector open={openNode()} onOpenChange={setOpenNode} />
              <Separator orientation="vertical" />

              <LinkSelector open={openLink()} onOpenChange={setOpenLink} />
              <Separator orientation="vertical" />
              <MathSelector />
              <Separator orientation="vertical" />
              <TextButtons />
              <Separator orientation="vertical" />
              <ColorSelector open={openColor()} onOpenChange={setOpenColor} />
            </GenerativeMenuSwitch>
          </EditorContent>
        </EditorRoot>
      </div>
    </Show>
  );
};

export default TailwindAdvancedEditor;
