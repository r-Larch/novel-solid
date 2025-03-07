import { createEffect, createSignal, Setter, Signal } from "solid-js";

const useLocalStorage = <T>(
  key: string,
  initialValue: T,
  // eslint-disable-next-line no-unused-vars
): Signal<T> => {
  const [storedValue, setStoredValue] = createSignal(initialValue);

  createEffect(() => {
    // Retrieve from localStorage
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  const setValue: Setter<T> = (...args) => {
    // Save state
    const result = setStoredValue(...args as any);
    // Save to localStorage
    window.localStorage.setItem(key, JSON.stringify(result));

    return result;
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
