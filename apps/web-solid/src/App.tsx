import type { Component } from 'solid-js';

import { TailwindAdvancedEditor } from './editor';
import { Toaster } from 'solid-sonner';

const App: Component = () => {
  return (
    <div class="flex min-h-screen flex-col items-center gap-4 py-4 sm:px-5">
      <TailwindAdvancedEditor />
      <Toaster theme="system" />
    </div>
  );
};

export default App;
