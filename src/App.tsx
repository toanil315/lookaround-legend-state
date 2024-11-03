import { Observable } from "@legendapp/state";
import { Memo, useObservable } from "@legendapp/state/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

function NormalComponent() {
  const [count, setCount] = useState(1);
  const renderCount = useRef(1).current++;

  console.log("NormalComponent render");

  useEffect(() => {
    setInterval(() => {
      setCount((v) => v + 1);
    }, 1000);
  }, []);

  // This re-renders when count changes
  return (
    <div>
      <h5>Normal</h5>
      <div>Renders: {renderCount}</div>
      <div>Count: {count}</div>
    </div>
  );
}
function FineGrained() {
  const count$ = useObservable(1);
  const renderCount = useRef(1).current++;

  console.log("FineGrained render");

  useEffect(() => {
    setInterval(() => {
      count$.set((v) => v + 1);
    }, 1000);
  }, []);

  // The text updates itself so the component doesn't re-render
  return (
    <div>
      <h5>Fine-grained</h5>
      <div>Renders: {renderCount}</div>
      <div>
        Count: <Memo>{count$}</Memo>
      </div>
    </div>
  );
}

function Parent() {
  const count$ = useObservable(1);
  const state$ = useObservable({ name: "John" });

  console.log("Parent render");

  return (
    <div>
      <h5>Parent</h5>
      <div>
        Count: <Memo>{count$}</Memo>
      </div>
      <Child count$={count$} />
      <button onClick={() => count$.set((v) => v + 1)}>
        Increment Count 1
      </button>
      <Child2 state$={state$} />
      <button onClick={() => state$.set({ name: `Updated at ${Date.now()}` })}>
        Change Name to Jane
      </button>
    </div>
  );
}

function Child({ count$ }: { count$: Observable<number> }) {
  console.log("Child1 render");

  return (
    <div>
      <h5>Child</h5>
      <div>
        Count: <Memo>{count$}</Memo>
      </div>
    </div>
  );
}

function Child2({ state$ }: { state$: Observable<{ name: string }> }) {
  console.log("Child2 render");

  return (
    <div>
      <h5>Child2</h5>
      <div>
        Name: <Memo>{state$.name}</Memo>
      </div>
    </div>
  );
}

const StateContext = createContext<Observable<{
  profile: { name: string };
}> | null>(null);

function Provider({ children }: { children: React.ReactNode }) {
  const state$ = useObservable({
    profile: {
      name: "",
    },
  });

  return (
    <StateContext.Provider value={state$}>{children}</StateContext.Provider>
  );
}

function ContextChild() {
  const count$ = useObservable(0);
  const state$ = useContext(StateContext);
  const renderCount = useRef(1).current++;

  console.log("ContextChild render");

  if (!state$) {
    throw new Error("No state context");
  }

  return (
    <div>
      <h5>ContextChild</h5>
      <div>Renders: {renderCount}</div>
      <div>
        Name: <Memo>{state$.profile.name}</Memo>
      </div>
      <div>
        Count: <Memo>{count$}</Memo>
        <button onClick={() => count$.set((v) => v + 1)}>
          Increment Count
        </button>
      </div>
    </div>
  );
}

function ContextTrigger() {
  const state$ = useContext(StateContext);

  if (!state$) {
    throw new Error("No state context");
  }

  return (
    <button
      onClick={() =>
        state$.profile.set((v) => ({ ...v, name: `Updated at ${Date.now()}` }))
      }
    >
      Change Name
    </button>
  );
}

export default function App() {
  return (
    <>
      <div>
        <h1>First Example: Compare vs useState</h1>
        <NormalComponent />
        <hr color="#eeeeee" />
        <FineGrained />
      </div>
      <hr />
      <div>
        <h1>Second Example: Props Drilling</h1>
        <Parent />
      </div>
      <div>
        <h1>Third Example: with context</h1>
        <Provider>
          <ContextChild />
          <ContextTrigger />
        </Provider>
      </div>
    </>
  );
}
