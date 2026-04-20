import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useLocation, useNavigate } from "react-router";
import { Box, Text } from "../../components/ThemedComponents.tsx";
import { isEnter } from "../../helpers/opentui/key.ts";

export function ScopePage() {
  const navigate = useNavigate();
  const location = useLocation();

  useKeyboard((event) => {
    if (isEnter(event)) {
      navigate({
        pathname: "/init/profile",
        search: location.search,
      });
    }
  });

  return (
    <Box flexDirection="column">
      <Text attributes={TextAttributes.BOLD}>Scope page</Text>
      <Text attributes={TextAttributes.DIM}>
        Press Enter to continue to the sample profile page.
      </Text>
    </Box>
  );
}
