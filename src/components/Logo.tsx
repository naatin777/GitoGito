import { TextAttributes } from "@opentui/core";
import { createAppDependencies } from "../app/app_extra.ts";
import { runTuiWithRedux } from "../lib/runner.tsx";
import { Box, Text } from "./ThemedComponents";

const yellow = "#FFFF00";
const orange = "#FFAF00";
const gold = "#FFD700";
const cream = "#FFFFD7";

type LogoSegment = {
  text: string;
  fg?: string;
  attributes?: number;
};

const art: ReadonlyArray<ReadonlyArray<LogoSegment>> = [
  [
    { text: " ,／⌒八⌒＼、", fg: yellow },
  ],
  [
    { text: "／", fg: yellow },
    { text: "／", fg: orange },
    { text: "　　　　　", fg: cream },
    { text: "＼", fg: orange },
    { text: "＼", fg: yellow },
  ],
  [
    { text: "／", fg: yellow },
    { text: "／", fg: orange },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　　　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＼", fg: orange },
    { text: "＼", fg: yellow },
  ],
  [
    { text: "（", fg: yellow },
    { text: "（", fg: orange },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "）", fg: orange },
    { text: "）", fg: yellow },
  ],
  [
    { text: "（", fg: yellow },
    { text: "（", fg: orange },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "）", fg: orange },
    { text: "）", fg: yellow },
  ],
  [
    { text: "（", fg: yellow },
    { text: "（", fg: orange },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "＊", fg: gold },
    { text: "　", fg: cream },
    { text: "）", fg: orange },
    { text: "）", fg: yellow },
  ],
  [
    { text: "（（", fg: orange },
    { text: "　 ,,　　　　,,　 ", attributes: TextAttributes.DIM },
    { text: "））", fg: orange },
  ],
  [
    { text: "（（（", fg: orange },
    { text: " ,,＿＿＿＿,, ", attributes: TextAttributes.DIM },
    { text: "）））", fg: orange },
  ],
  [
    { text: "＼＼＿＿＿＿＿＿／／", fg: orange },
  ],
  [
    { text: "～＊～＊～＊～＊～＊～＊～＊～", fg: gold },
  ],
];

export function Logo() {
  return (
    <Box
      width={30}
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {art.map((row, rowIndex) => (
        <Box key={rowIndex} flexDirection="row">
          {row.map((segment, segmentIndex) => (
            <Text
              key={`${rowIndex}-${segmentIndex}`}
              fg={segment.fg}
              attributes={segment.attributes}
            >
              {segment.text}
            </Text>
          ))}
        </Box>
      ))}
    </Box>
  );
}

/* v8 ignore start */
if (import.meta.main) {
  const dependencies = createAppDependencies();
  await runTuiWithRedux(
    <Box width="100%" height="100%" justifyContent="center" alignItems="center">
      <Logo />
    </Box>,
    { dependencies },
  );
}
/* v8 ignore stop */
