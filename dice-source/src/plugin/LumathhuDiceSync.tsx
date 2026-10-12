import { useEffect, useRef } from "react";
import { useDiceRollStore } from "../dice/store";

/** Bridges the original Owlbear dice physics to the LUMATHHU parent window.
 * Only initial roll parameters are transmitted; each client runs the same
 * deterministic Rapier simulation locally. */
export function LumathhuDiceSync() {
  const receiving = useRef(false);
  const lastSent = useRef<string>("");

  useEffect(() => {
    const unsubscribe = useDiceRollStore.subscribe((state, previous) => {
      if (receiving.current || !state.roll) return;
      const ids = Object.keys(state.rollThrows).sort().join(",");
      const key = JSON.stringify({ roll: state.roll, ids, throws: state.rollThrows });
      if (key === lastSent.current || !ids) return;
      // Send only when a new throw begins, not on every result update.
      const oldIds = Object.keys(previous.rollThrows).sort().join(",");
      if (ids === oldIds && previous.roll === state.roll) return;
      lastSent.current = key;
      window.parent.postMessage({ type: "lumathhu-dice-roll", roll: state.roll, throws: state.rollThrows }, window.location.origin);
    });
    const receive = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || data.type !== "lumathhu-dice-roll" || !data.remote || !data.roll || !data.throws) return;
      receiving.current = true;
      lastSent.current = JSON.stringify({ roll: data.roll, ids: Object.keys(data.throws).sort().join(","), throws: data.throws });
      useDiceRollStore.getState().startSyncedRoll(data.roll, data.throws);
      // Zustand subscribers run synchronously; release guard on next task.
      window.setTimeout(() => { receiving.current = false; }, 0);
    };
    window.addEventListener("message", receive);
    return () => { unsubscribe(); window.removeEventListener("message", receive); };
  }, []);
  return null;
}
