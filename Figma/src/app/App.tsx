import { useEffect, useRef } from "react";

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import("./widi.js").then((mod) => {
      if (mountRef.current) cleanup = mod.init(mountRef.current);
    });
    return () => cleanup?.();
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh", overflow: "hidden" }} />;
}
