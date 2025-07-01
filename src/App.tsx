import { Accessor, createEffect, createMemo, createSignal, onMount } from "solid-js";
import "./App.css";
import { listen } from "@tauri-apps/api/event";
import { getAllWindows, PhysicalPosition, PhysicalSize } from "@tauri-apps/api/window";

const COLORS = [
  { range: 60, color: "#FFFF00" },
  { range: 80, color: "#FFA500" },
  { range: 100, color: "#FF6347" },
  { range: 120, color: "#FF0000" },
  { range: 255, color: "#8B0000" }
];

const DEFAULT_FONT_SIZE = 64;

// ♥ (U+2665), ♡ (U+2661), and ❤ (U+2764)
const HEART = "❤"

function Child({ style, n }: { style: Accessor<number>, n: Accessor<number> }) {
  console.log('---style', style())
  if (style() === 0) {
    return <>{n()}</>
  }

  if (style() === 1) {
    return <>{[HEART, n()].join("")}</>
  }

  if (style() === 2) {
    const len = n.toString().length
    let textSize = DEFAULT_FONT_SIZE
    if (len <= 1) {
      textSize = DEFAULT_FONT_SIZE
    } else if (len <= 2) {
      textSize = DEFAULT_FONT_SIZE / 2
    } else if (len <= 3) {
      textSize = (DEFAULT_FONT_SIZE / 3) || 0
    }
    return <><div id='heart'>{HEART}</div><div id="text" style={{ "font-size": `${textSize}px` }}>{n()}</div></>
  }

  return <>{n()}</>
}

function getSize(style: number, n: number) {
  const len = n.toString().length;
  if (style === 0) {
    // only text
    return { w: DEFAULT_FONT_SIZE * len, h: DEFAULT_FONT_SIZE * len }
  }

  // heart + text
  if (style === 1) {
    return { w: DEFAULT_FONT_SIZE * (len + 1), h: DEFAULT_FONT_SIZE * (len + 1) }
  }

  // text in heart
  if (style === 2) {
    return { w: DEFAULT_FONT_SIZE, h: DEFAULT_FONT_SIZE }
  }

  return { w: DEFAULT_FONT_SIZE, h: DEFAULT_FONT_SIZE }
}

function App() {
  const [getRate, setRate] = createSignal(0)
  const [getStyle, setStyle] = createSignal(0)
  const color = createMemo(() => {
    const rate = getRate()
    for (const i of COLORS) {
      if (rate < i.range) {
        return i.color
      }
    }
    return COLORS[0].color
  })


  onMount(async () => {
    const inputHandle = await listen<number>("heart-rate", (event) => {
      setRate((+event.payload))
    })
    const styleHandle = await listen<number>("set-style", (event) => {
      setStyle((+event.payload))
    })
    return () => {
      inputHandle();
      styleHandle();
    }
  })

  createEffect(async () => {
    const rect = getSize(getStyle(), getRate())
    const v = await getAllWindows()
    const win = v.find((win) => win.label === "main");
    if (!win) {
      return
    }
    win.setSize(new PhysicalSize(rect.w, rect.h))
  })

  let drag = false
  let dragStartPosition = { x: 0, y: 0 }

  return (
    <div id='main' style={{ color: color() }}
      onMouseDown={e => {
        drag = true
        dragStartPosition.x = e.offsetX
        dragStartPosition.y = e.offsetY
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
      onmouseup={() => {
        drag = false
      }}
    ><Child style={getStyle} n={getRate} /></div>
  );
}

export default App;
