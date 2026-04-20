import { TextAttributes } from "@opentui/core";
import { useKeyboard, useRenderer } from "@opentui/react";
import {
  useLocation,
  useNavigate,
  useSearchParams
} from "react-router";
import { Box, Text } from "../../components/ThemedComponents.tsx";
import { useThemeColors } from "../config/use_theme_colors.ts";
import { isCtrlC, isEnter } from "../../helpers/opentui/key.ts";

export function DonePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const renderer = useRenderer();
  const themeColors = useThemeColors();
  const profile = searchParams.get("profile") ?? "guided";

  useKeyboard((event) => {
    if (event.name === "left") {
      navigate({
        pathname: "/init/review",
        search: location.search,
      });
      return;
    }

    if (isEnter(event) || event.name === "escape" || isCtrlC(event)) {
      renderer.destroy();
    }
  });

  return (
    <Box flexDirection="column">
      <Text fg={themeColors.success} attributes={TextAttributes.BOLD}>
        Done page
      </Text>
      <Text>Sample init flow completed.</Text>
      <Text>Profile: {profile}</Text>
      <Text attributes={TextAttributes.DIM}>
        Press Left to review again, or Enter to close the TUI.
      </Text>
    </Box>
  );
}
