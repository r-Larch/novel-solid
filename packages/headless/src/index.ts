// Components
export {
  EditorRoot,
  EditorContent,
  type EditorContentProps,
  EditorBubble,
  EditorBubbleItem,
  EditorCommand,
  EditorCommandList,
  EditorCommandItem,
  EditorCommandEmpty,
  useEditor,
  type EditorInstance,
  type JSONContent,
} from "./components";

// Extensions
export {
  AIHighlight,
  removeAIHighlight,
  addAIHighlight,
  CodeBlockLowlight,
  HorizontalRule,
  InputRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapUnderline,
  MarkdownExtension,
  TextStyle,
  Color,
  HighlightExtension,
  CustomKeymap,
  TiptapLink,
  UpdatedImage,
  Youtube,
  Mathematics,
  CharacterCount,
  GlobalDragHandle,
  Command,
  renderItems,
  createSuggestionItems,
  handleCommandNavigation,
  type SuggestionItem,
} from "./extensions";

// Plugins
export {
  UploadImagesPlugin,
  type UploadFn,
  type ImageUploadOptions,
  createImageUpload,
  handleImageDrop,
  handleImagePaste,
} from "./plugins";

// Utils
export {
  isValidUrl,
  getUrlFromString,
  getPrevText,
  getAllContent,
} from "./utils";

// Store
export { useNovelStore } from "./utils/store";
