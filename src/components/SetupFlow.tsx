// import { Box, render, useApp } from "ink";
// import { useState } from "react";
// import {
//   EditorSelector,
//   LanguageSelector,
//   OverviewInput,
// } from "./Selection.tsx";
// import { envService } from "../services/config/env.ts";

// export type SetupStep = "language" | "editor" | "overview" | "done";

// export function SetupFlow(
//   { scope, onDone }: { scope: ConfigScope; onDone?: (config: Config) => void },
// ) {
//   const [step, setStep] = useState<SetupStep>("language");
//   const [config, setConfig] = useState<Config>({
//     language: "",
//     editor: "",
//     overview: "",
//     provider: "ChatGPT",
//     model: "",
//   });
//   const { exit } = useApp();

//   const handleLanguage = (language: string) => {
//     setConfig((prev) => ({ ...prev, language }));
//     setStep("editor");
//   };

//   const handleEditor = (editor: string) => {
//     setConfig((prev) => ({ ...prev, editor }));
//     setStep("overview");
//   };

//   const handleOverview = async (overview: string) => {
//     const finalConfig = { ...config, overview };
//     setConfig(finalConfig);
//     const configService = new ConfigService(scope, envService);
//     await configService.save(finalConfig, scope);
//     setStep("done");
//     if (onDone) onDone(finalConfig);
//     exit();
//   };

//   return (
//     <Box flexDirection="column">
//       {step === "language" && <LanguageSelector onSelect={handleLanguage} />}
//       {step === "editor" && <EditorSelector onSelect={handleEditor} />}
//       {step === "overview" && <OverviewInput onSubmit={handleOverview} />}
//     </Box>
//   );
// }

// if (import.meta.main) {
//   render(<SetupFlow scope="local" />);
// }
