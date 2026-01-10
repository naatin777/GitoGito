#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run

/**
 * Rename all kebab-case files to snake_case following Deno style guide
 */

import { walk } from "@std/fs/walk";
import { relative } from "@std/path";

// Convert kebab-case to snake_case
function kebabToSnake(filename: string): string {
  return filename.replace(/-/g, "_");
}

// Get all TypeScript files with kebab-case names
async function getKebabCaseFiles(): Promise<string[]> {
  const kebabFiles: string[] = [];

  for await (
    const entry of walk(".", {
      includeDirs: false,
      match: [/\.tsx?$/],
      skip: [/node_modules/, /\.git/],
    })
  ) {
    const relativePath = relative(".", entry.path);
    if (relativePath.includes("-") && !relativePath.includes("node_modules")) {
      kebabFiles.push(relativePath);
    }
  }

  return kebabFiles;
}

// Rename a single file using git mv
async function renameFile(oldPath: string, newPath: string): Promise<void> {
  const command = new Deno.Command("git", {
    args: ["mv", oldPath, newPath],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stderr } = await command.output();

  if (code !== 0) {
    const errorString = new TextDecoder().decode(stderr);
    console.error(`Failed to rename ${oldPath}: ${errorString}`);
    throw new Error(`git mv failed for ${oldPath}`);
  }

  console.log(`✓ Renamed: ${oldPath} → ${newPath}`);
}

// Main execution
async function main() {
  console.log("Finding kebab-case TypeScript files...\n");

  const kebabFiles = await getKebabCaseFiles();

  if (kebabFiles.length === 0) {
    console.log("No kebab-case files found!");
    return;
  }

  console.log(`Found ${kebabFiles.length} files to rename:\n`);

  // Create rename mapping
  const renameMap = new Map<string, string>();

  for (const file of kebabFiles) {
    const newFile = kebabToSnake(file);
    renameMap.set(file, newFile);
    console.log(`  ${file} → ${newFile}`);
  }

  console.log("\n");

  // Ask for confirmation
  const response = prompt("Proceed with renaming? (y/n): ");

  if (response?.toLowerCase() !== "y") {
    console.log("Aborted.");
    Deno.exit(0);
  }

  console.log("\nRenaming files...\n");

  // Rename files
  for (const [oldPath, newPath] of renameMap) {
    await renameFile(oldPath, newPath);
  }

  console.log("\n✓ All files renamed successfully!");
  console.log("\nNext steps:");
  console.log(
    "1. Update all import paths with: deno run -A scripts/update_imports.ts",
  );
  console.log("2. Run type check: deno check src/main.ts");
  console.log("3. Run tests: deno test --allow-all");
}

if (import.meta.main) {
  main();
}
