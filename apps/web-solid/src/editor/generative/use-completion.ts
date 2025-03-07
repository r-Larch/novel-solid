


type UseCompletionOptions = {
    api: string;
    onResponse: (response: Response) => void;
    onError: (error: any) => void;
}

export function useCompletion(options: UseCompletionOptions): CompletionResult {
    return {
        completion: '',
        isLoading: false,
        async complete(prompt, options_) {
            options.onError(new Error('Not Implemented!'));
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
