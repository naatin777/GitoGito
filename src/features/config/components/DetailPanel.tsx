import { Box, Text } from "ink";
import type { TreeItem } from "./TreeList.tsx";

interface DetailPanelProps {
  item: TreeItem;
  width: number;
  height: number;
}

export const DetailPanel = ({ item, width, height }: DetailPanelProps) => {
  const fullPath = [...item.parents, item.key].join(".");

  return (
    <Box flexDirection="column" flexGrow={1} paddingLeft={2}>
      <Box
        borderStyle="round"
        paddingX={1}
        width={width}
        height={height}
        flexDirection="column"
      >
        <Text>
          {fullPath}
        </Text>
        <Text>
          {item.description}
        </Text>
      </Box>
    </Box>
  );
};
