"use client";

import { Component, type ReactNode, useState } from "react";
import ModelViewer from "@/components/ModelViewer";

type ErrorBoundaryProps = {
children: ReactNode;
};

type ErrorBoundaryState = {
hasError: boolean;
};

class ModelErrorBoundary extends Component<
ErrorBoundaryProps,
ErrorBoundaryState
> {
    state: ErrorBoundaryState = {
    hasError: false,
    };

static getDerivedStateFromError(): ErrorBoundaryState {
return {
hasError: true,
};
}

render() {
if (this.state.hasError) {
return ( <div className="flex h-[600px] w-full items-center justify-center"> <p>Could not load model</p> </div>
);
}


return this.props.children;

}
}

export default function Home() {
const [autoRotate, setAutoRotate] = useState(false);
const [resetKey, setResetKey] = useState(0);

return ( <main className="min-h-screen"> <div className="flex items-center gap-4 p-4">
<button
type="button"
onClick={() => setResetKey((value) => value + 1)}
className="rounded border px-3 py-2"
>
Reset view </button>

    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={autoRotate}
        onChange={(event) => setAutoRotate(event.target.checked)}
      />
      Auto-rotate
    </label>
  </div>

  <ModelErrorBoundary>
    <ModelViewer
      url="/samples/chest.glb"
      autoRotate={autoRotate}
      resetKey={resetKey}
    />
  </ModelErrorBoundary>
</main>


);
}
