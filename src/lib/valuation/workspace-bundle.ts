export const WORKSPACE_BUNDLE_SCHEMA_ID = "penilaian-valuasi-bisnis.workspace-bundle";
export const WORKSPACE_BUNDLE_SCHEMA_VERSION = 1;

export type WorkspaceBundleEntry = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  data: unknown;
};

export type WorkspaceBundlePayload = {
  schema: typeof WORKSPACE_BUNDLE_SCHEMA_ID;
  schemaVersion: typeof WORKSPACE_BUNDLE_SCHEMA_VERSION;
  sourceAppStorageVersion: number;
  exportedAt: string;
  appName: "Penilaian Bisnis II";
  activeWorkspaceId: string;
  workspaces: WorkspaceBundleEntry[];
};

type WorkspaceBundleBuildInput = Omit<WorkspaceBundlePayload, "schema" | "schemaVersion" | "appName">;

export function buildWorkspaceBundlePayload(input: WorkspaceBundleBuildInput): WorkspaceBundlePayload {
  if (!Number.isInteger(input.sourceAppStorageVersion) || input.sourceAppStorageVersion < 1) {
    throw new Error("Versi penyimpanan aplikasi sumber tidak valid.");
  }
  if (!input.exportedAt || !input.activeWorkspaceId || input.workspaces.length === 0) {
    throw new Error("Bundle workspace tidak memiliki metadata lengkap.");
  }
  assertWorkspaceBundleEntries(input.workspaces, input.activeWorkspaceId);

  return {
    schema: WORKSPACE_BUNDLE_SCHEMA_ID,
    schemaVersion: WORKSPACE_BUNDLE_SCHEMA_VERSION,
    sourceAppStorageVersion: input.sourceAppStorageVersion,
    exportedAt: input.exportedAt,
    appName: "Penilaian Bisnis II",
    activeWorkspaceId: input.activeWorkspaceId,
    workspaces: input.workspaces.map((workspace) => ({ ...workspace })),
  };
}

export function parseWorkspaceBundlePayload(raw: string): WorkspaceBundlePayload {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("File bundle JSON tidak valid atau rusak.");
  }

  if (!isRecord(value) || value.schema !== WORKSPACE_BUNDLE_SCHEMA_ID) {
    throw new Error("File JSON bukan export seluruh workspace Penilaian Bisnis II.");
  }
  if (value.schemaVersion !== WORKSPACE_BUNDLE_SCHEMA_VERSION) {
    throw new Error("Versi schema bundle workspace belum didukung.");
  }
  if (
    !Number.isInteger(value.sourceAppStorageVersion) ||
    (value.sourceAppStorageVersion as number) < 1 ||
    typeof value.exportedAt !== "string" ||
    typeof value.activeWorkspaceId !== "string" ||
    !Array.isArray(value.workspaces)
  ) {
    throw new Error("Metadata bundle workspace tidak lengkap.");
  }

  const workspaces = value.workspaces.map((workspace, index) => parseWorkspaceBundleEntry(workspace, index));
  assertWorkspaceBundleEntries(workspaces, value.activeWorkspaceId);

  return {
    schema: WORKSPACE_BUNDLE_SCHEMA_ID,
    schemaVersion: WORKSPACE_BUNDLE_SCHEMA_VERSION,
    sourceAppStorageVersion: value.sourceAppStorageVersion as number,
    exportedAt: value.exportedAt,
    appName: "Penilaian Bisnis II",
    activeWorkspaceId: value.activeWorkspaceId,
    workspaces,
  };
}

export function buildWorkspaceBundleFilename(exportedAt: string): string {
  const datePart = exportedAt.slice(0, 10) || "export";
  return `penilaian-bisnis-semua-workspace-${datePart}.json`;
}

function parseWorkspaceBundleEntry(value: unknown, index: number): WorkspaceBundleEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string" ||
    !("data" in value)
  ) {
    throw new Error(`Workspace ke-${index + 1} dalam bundle tidak valid.`);
  }

  const id = value.id.trim();
  const name = value.name.trim();
  if (!id || !name || !isRecord(value.data)) {
    throw new Error(`Workspace ke-${index + 1} dalam bundle tidak memiliki data lengkap.`);
  }

  return {
    id,
    name,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    data: value.data,
  };
}

function assertWorkspaceBundleEntries(workspaces: WorkspaceBundleEntry[], activeWorkspaceId: string): void {
  if (workspaces.length === 0) {
    throw new Error("Bundle tidak berisi workspace.");
  }

  const ids = new Set<string>();
  for (const workspace of workspaces) {
    const id = workspace.id.trim();
    const name = workspace.name.trim();
    if (!id || !name || !isRecord(workspace.data)) {
      throw new Error("Bundle memuat workspace tanpa ID, nama, atau data yang valid.");
    }
    if (ids.has(id)) {
      throw new Error(`Bundle memuat ID workspace duplikat: ${id}.`);
    }
    ids.add(id);
  }

  if (!ids.has(activeWorkspaceId)) {
    throw new Error("Workspace aktif pada bundle tidak ditemukan dalam daftar workspace.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
