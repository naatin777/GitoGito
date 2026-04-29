import { expect, test } from "bun:test";
import { type ConfigFile, type ConfigScope, ConfigServiceImpl } from "@gitogito/core";

class ConfigFileMock implements ConfigFile {
  private readonly contents = new Map<ConfigScope, string>();
  private readonly paths: Record<ConfigScope, string> = {
    global: "/mock/global.yml",
    project: "/mock/project.yml",
    local: "/mock/local.yml",
  };

  pathFor(scope: ConfigScope): string {
    return this.paths[scope];
  }

  load(scope: ConfigScope): Promise<string> {
    return Promise.resolve(this.contents.get(scope) ?? "");
  }

  save(scope: ConfigScope, data: string): Promise<void> {
    this.contents.set(scope, data);
    return Promise.resolve();
  }

  exists(scope: ConfigScope): Promise<boolean> {
    return Promise.resolve(this.contents.has(scope));
  }
}

test("setScalar writes nested key into empty document", async () => {
  const file = new ConfigFileMock();
  const svc = new ConfigServiceImpl(file);
  const r = await svc.setScalar("project", "section.key", "v", { dryRun: false });
  expect(r.isOk()).toBe(true);
  const text = await file.load("project");
  expect(text).toContain("section");
  expect(text).toContain("key");
  expect(text).toContain("v");
});

test("setScalar dryRun does not save", async () => {
  const file = new ConfigFileMock();
  const svc = new ConfigServiceImpl(file);
  const r = await svc.setScalar("global", "a", "b", { dryRun: true });
  expect(r.isOk()).toBe(true);
  if (r.isOk()) {
    expect(r.value.path).toBe("/mock/global.yml");
  }
  expect(await file.load("global")).toBe("");
});

test("setScalar preserves a leading comment line", async () => {
  const file = new ConfigFileMock();
  await file.save("project", "# keep me\nfoo: 1\n");
  const svc = new ConfigServiceImpl(file);
  const r = await svc.setScalar("project", "bar", "2", { dryRun: false });
  expect(r.isOk()).toBe(true);
  const text = await file.load("project");
  expect(text).toContain("# keep me");
  expect(text).toContain("foo");
  expect(text).toContain("bar");
});

test("setScalar returns invalid_yaml for non-mapping root", async () => {
  const file = new ConfigFileMock();
  await file.save("local", "- x\n");
  const svc = new ConfigServiceImpl(file);
  const r = await svc.setScalar("local", "a", "b", { dryRun: false });
  expect(r.isErr()).toBe(true);
  if (r.isErr()) {
    expect(r.error.code).toBe("invalid_yaml");
  }
});

test("resolvedPath is returned on success", async () => {
  const file = new ConfigFileMock();
  const svc = new ConfigServiceImpl(file);
  const r = await svc.setScalar("project", "k", "v", { dryRun: false });
  expect(r.isOk()).toBe(true);
  if (r.isOk()) {
    expect(r.value.path).toBe("/mock/project.yml");
  }
});
