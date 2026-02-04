import { useStdout } from "ink";
import { useEffect, useState } from "react";

export interface TerminalSize {
  width: number;
  height: number;
}

export const useTerminalSize = (): TerminalSize => {
  const { stdout } = useStdout();
  const [size, setSize] = useState<TerminalSize>({
    width: stdout.columns,
    height: stdout.rows,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: stdout.columns,
        height: stdout.rows,
      });
    };

    Deno.addSignalListener("SIGWINCH", handleResize);
    return () => {
      Deno.removeSignalListener("SIGWINCH", handleResize);
    };
  }, [stdout]);

  return size;
};
