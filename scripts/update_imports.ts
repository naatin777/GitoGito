#!/usr/bin/env -S deno run --allow-read --allow-write

/**
 * Update all import paths from kebab-case to snake_case
 */

import { walk } from "@std/fs/walk";

// Convert kebab-case to snake_case in import paths
function updateImportPaths(content: string): string {
  // Match import/export statements with kebab-case file paths
  const importRegex = /(from\s+["'])(\.\.?\/[^"']*?)(-[^"']*?)(["'])/g;

  return content.replace(importRegex, (match, p1, p2, p3, p4) => {
    // Convert hyphens to underscores in the path
    const newPath = (p2 + p3).replace(/-/g, "_");
    return p1 + newPath + p4;
  });
}

// Update a single file
async function updateFile(filePath: string): Promise<boolean> {
  const content = await Deno.readTextFile(filePath);
  const updated = updateImportPaths(content);

  if (content !== updated) {
    await Deno.writeTextFile(filePath, updated);
    console.log(`✓ Updated: ${filePath}`);
    return true;
  }

  return false;
}

// Main execution
async function main() {
  console.log("Updating import paths from kebab-case to snake_case...\n");

  let updatedCount = 0;

  for await (
    const entry of walk(".", {
      includeDirs: false,
      match: [/\.tsx?$/],
      skip: [/node_modules/, /\.git/, /scripts/],
    })
  ) {
    if (await updateFile(entry.path)) {
      updatedCount++;
    }
  }

  console.log(`\n✓ Updated ${updatedCount} files with new import paths`);
}

if (import.meta.main) {
  main();
}
