import { createSignal } from "solid-js";



type UseCompletionOptions = {
    api: string;
    onResponse: (response: Response) => void;
    onError: (error: any) => void;
}

export function useCompletion(options: UseCompletionOptions): CompletionResult {

    const text = `
**Heading**

This is a paragraph with some **bold** text and some *italic* text.  
You can also use \`inline code\` for short code snippets.

### Lists

- Item 1
- Item 2
  - Subitem 2.1
  - Subitem 2.2
- Item 3

### Numbered List

1. First item
2. Second item
3. Third item

### Blockquote

> This is a blockquote. It can be used to emphasize important information.

### Images

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/4/48/Markdown-mark.svg)

### Code Block

\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`

### Links

You can add a [link to OpenAI](https://openai.com).
`;

    const [completion, setCompletion] = createSignal('');
    const [loading, setLoading] = createSignal(false);

    const tokens = text.split('')

    return {
        get completion() { return completion() },
        get isLoading() { return loading() },
        async complete(prompt, options_) {
            setLoading(true);
            await new Promise((r) => setTimeout(r, 1000));
            await new Promise((r) => {
                let i = 0;
                const id = setInterval(() => {
                    if (i === tokens.length) {
                        clearInterval(id);
                        r(undefined);
                        setLoading(false);
                        return;
                    }
                    const token = tokens[i++]
                    setCompletion(_ => _ + token)
                    console.log(completion())
                }, 5)
            })
        },
    }
}

type CompletionResult = {
    complete(prompt: string, options?: CompletionOptions): Promise<void>;
    readonly completion: string;
    readonly isLoading: boolean;
}

type CompletionOptions = {
    body: any;
}
