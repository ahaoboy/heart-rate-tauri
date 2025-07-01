import { createSignal, onMount } from "solid-js";
import "./App.css";
import { listen } from "@tauri-apps/api/event";

function App() {
  const [greetMsg, setGreetMsg] = createSignal("");

  onMount(async () => {
    const inputHandle = await listen<number>("heart-rate", (event) => {
      console.log('heart-rate', event)
    })

    console.log('inputHandle', inputHandle)
  })

  return (
    <div></div>
  );
}

export default App;
