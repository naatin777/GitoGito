import { Box, useInput } from "ink";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks.ts";
import type { FlatSchemaItem } from "../../helpers/flat_schema.ts";
import { useTerminalSize } from "../../hooks/use_terminal_size.ts";
import { DetailPanel } from "./components/DetailPanel.tsx";
import { TreeList } from "./components/TreeList.tsx";
import {
  initializeConfigTree,
  moveDown,
  moveUp,
  selectConfigFilteredItems,
  selectConfigOpenPaths,
  selectConfigSelectedIndex,
  toggleItem,
} from "./config_slice.ts";
import {
  DETAIL_PANEL_PADDING,
  HEADER_HEIGHT,
  TREE_LIST_WIDTH,
} from "./constants.ts";

export interface ConfigUIProps {
  flattenConfigSchema: FlatSchemaItem[];
}

export const ConfigUI = ({ flattenConfigSchema }: ConfigUIProps) => {
  const dispatch = useAppDispatch();
  const size = useTerminalSize();
  const selectedIndex = useAppSelector(selectConfigSelectedIndex);
  const filteredItems = useAppSelector(selectConfigFilteredItems);
  const openPaths = useAppSelector(selectConfigOpenPaths);

  useEffect(() => {
    dispatch(initializeConfigTree(flattenConfigSchema));
  }, [dispatch]);

  useInput((input, key) => {
    if (key.upArrow) {
      dispatch(moveUp());
    } else if (key.downArrow) {
      dispatch(moveDown());
    } else if (key.return || input === " ") {
      dispatch(toggleItem(selectedIndex));
    }
  });

  const visibleRows = size.height - HEADER_HEIGHT;
  const detailPanelWidth = size.width - TREE_LIST_WIDTH -
    DETAIL_PANEL_PADDING;
  const detailPanelHeight = size.height - HEADER_HEIGHT;
  const selectedItem = filteredItems[selectedIndex];

  if (!selectedItem) {
    return <Box />;
  }

  return (
    <Box flexDirection="column" height={size.height}>
      <Box flexDirection="row" height={size.height}>
        <Box flexDirection="column" width={40}>
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
            item={selectedItem}
            width={detailPanelWidth}
            height={detailPanelHeight}
          />
        </Box>
      </Box>
    </Box>
  );
};
