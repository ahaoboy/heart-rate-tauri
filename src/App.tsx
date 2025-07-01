import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import "./App.css";
import { listen } from "@tauri-apps/api/event";
import { getAllWindows, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";

const COLORS = [
  { range: 60, color: "#4682B4" },
  { range: 70, color: "#87CEEB" },
  { range: 80, color: "#90EE90" },
  { range: 90, color: "#FFFF00" },
  { range: 100, color: "#FFA500" },
  { range: 110, color: "#FF6347" },
  { range: 120, color: "#FF0000" },
  { range: 255, color: "#8B0000" }
];

const DEFAULT_FONT_SIZE = 64;

function measureTextSizeWithDOM(text: string, fontStyles: Record<string, string>) {
  const span = document.createElement('span');

  Object.assign(span.style, {
    position: 'absolute',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    ...fontStyles
  });

  span.textContent = text;

  document.body.appendChild(span);

  const size = {
    width: span.offsetWidth,
    height: span.offsetHeight
  };
  document.body.removeChild(span);
  return size;
}

// ♥ (U+2665), ♡ (U+2661), and ❤ (U+2764)
const HEART = "❤"

function App() {
  const [getRate, setRate] = createSignal(0)
  const color = createMemo(() => {
    const rate = getRate()
    for (const i of COLORS) {
      if (rate < i.range) {
        return i.color
      }
    }
    return COLORS[0].color
  })

  const text = createMemo(() => {
    const rate = getRate()
    return rate ? rate.toString() : "..."
  }, "...")

  onMount(async () => {
    const inputHandle = await listen<number>("heart-rate", (event) => {
      setRate((+event.payload))
    })
    return inputHandle
  })

  createEffect(async () => {
    const s = [HEART, text()].join(' ')
    const rect = measureTextSizeWithDOM(s, { fontSize: `${DEFAULT_FONT_SIZE}px` })
    const v = await getAllWindows()
    const win = v.find((win) => win.label === "main");
    if (!win) {
      return
    }
    win.setSize(new PhysicalSize(rect.width * 2, rect.height * 2))
  })

  let drag = false
  let dragStartPosition = { x: 0, y: 0 }

  return (
    <div id='main' style={{ color: color() }}
      onMouseDown={e => {
        // console.log('onMouseDown', e)
        drag = true
        dragStartPosition.x = e.offsetX
        dragStartPosition.y = e.offsetY
        console.log(dragStartPosition, drag, e)
      }}

      onMouseMove={async (e) => {
        if (!drag) {
          return
        }
        const v = await getAllWindows()
        const win = v.find((win) => win.label === "main");
        if (!win) {
          return
        }
        const dx = e.offsetX - dragStartPosition.x
        const dy = e.offsetY - dragStartPosition.y
        const p = await win.outerPosition()
        await win.setPosition(new PhysicalPosition(p.x + dx, p.y + dy))
      }}
      onmouseup={e => {
        drag = false
      }}
    >
      {/* TODO: suppor more styles */}
      {/* <div id='heart'>
        {HEART}
      </div>
      <div id="text">
        {text()}
      </div> */}

      {HEART} {text()}
    </div>
  );
}

export default App;
