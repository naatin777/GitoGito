import { Box, render, Text } from "ink";
import { useEffect, useState } from "react";
import { cycleZip } from "../helpers/collections/cycle_zip.ts";

type Frame = {
  frames: {
    color?: string;
    text: string;
  }[];
};

class FrameBuilder {
  frames: Frame[] = [{ frames: [] }];

  addFrame(color: (string | undefined)[], text: string[]) {
    const frames = cycleZip(color, text).map<Frame>((v) => ({
      frames: [{ color: v[0], text: v[1] }],
    }));
    this.frames = cycleZip(this.frames, frames).map((v) => ({
      frames: [...v[0].frames, ...v[1].frames],
    }));
    return this;
  }
  addSpace() {
    this.frames = cycleZip(this.frames, [{
      frames: [{ color: undefined, text: " " }],
    }]).map((v) => ({ frames: [...v[0].frames, ...v[1].frames] }));
    return this;
  }

  build() {
    return this.frames;
  }
}

const frames1 = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const frames2 = [
  "⠁⠁⠁",
  "⠂⠁⠁",
  "⠄⠂⠁",
  "⡀⠄⠂",
  "⢀⡀⠄",
  "⠠⢀⡀",
  "⠐⠠⢀",
  "⠈⠐⠠",
  "⠐⠈⠐",
  "⠠⠐⠈",
  "⠁⠠⠐",
  "⠁⠁⠠",
];

const defaultFrame = new FrameBuilder()
  .addFrame(["green"], frames1)
  .addSpace()
  .addFrame([undefined], ["Loading"])
  .addFrame([undefined], frames2)
  .build();

export function Spinner(
  { frame = defaultFrame, handleDataLoading }: {
    frame?: Frame[];
    handleDataLoading: () => Promise<void>;
  },
) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frame.length);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      await handleDataLoading();
    })();
  }, []);

  return (
    <Box paddingLeft={1} paddingRight={1}>
      {frame[frameIndex].frames.map((v, i) => {
        return <Text key={i} color={v.color}>{v.text}</Text>;
      })}
    </Box>
  );
}

if (import.meta.main) {
  const Example = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <Box>
        {isOpen && (
          <Spinner
            handleDataLoading={async () => {
              await setTimeout(() => setIsOpen(false), 10000);
            }}
          />
        )}
      </Box>
    );
  };

  render(
    <Example />,
  );
}
