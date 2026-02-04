import { Box, render, useInput } from "ink";
import { flatSchema } from "../../helpers/flat_schema.ts";
import { ConfigSchema } from "../../services/config/schema/config.ts";
import { DetailPanel } from "./components/DetailPanel.tsx";
import { TreeList } from "./components/TreeList.tsx";
import {
  DETAIL_PANEL_PADDING,
  HEADER_HEIGHT,
  TREE_LIST_WIDTH,
} from "./constants.ts";
import { useTerminalSize } from "./hooks/use_terminal_size.ts";
import { useTreeNavigation } from "./hooks/use_tree_navigation.ts";
import type { ConfigUIProps } from "./types.ts";

const flattenConfigSchema = flatSchema(ConfigSchema);

export const ConfigUI = (_props: ConfigUIProps) => {
  const size = useTerminalSize();
  const {
    selectedIndex,
    filteredItems,
    openPaths,
    toggleItem,
    moveUp,
    moveDown,
  } = useTreeNavigation(flattenConfigSchema);

  useInput((input, key) => {
    if (key.upArrow) {
      moveUp();
    } else if (key.downArrow) {
      moveDown();
    } else if (key.return || input === " ") {
      toggleItem(selectedIndex);
    }
  });

  const visibleRows = size.rows - HEADER_HEIGHT;
  const detailPanelWidth = size.columns - TREE_LIST_WIDTH -
    DETAIL_PANEL_PADDING;
  const detailPanelHeight = size.rows - HEADER_HEIGHT;

  return (
    <Box flexDirection="column" height={size.rows}>
      <Box flexDirection="row" height={size.rows}>
        <Box flexDirection="column" width={TREE_LIST_WIDTH}>
          <TreeList
            items={filteredItems}
            selectedIndex={selectedIndex}
            openPaths={openPaths}
            visibleRows={visibleRows}
          />
        </Box>
        <Box flexDirection="column" flexGrow={1}>
          <Box height={HEADER_HEIGHT} />
          <DetailPanel
            item={filteredItems[selectedIndex]}
            width={detailPanelWidth}
            height={detailPanelHeight}
          />
        </Box>
      </Box>
    </Box>
  );
};

render(<ConfigUI />);
