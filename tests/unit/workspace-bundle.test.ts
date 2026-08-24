import assert from "node:assert/strict";
import { test } from "node:test";

import {
  buildWorkspaceBundleFilename,
  buildWorkspaceBundlePayload,
  parseWorkspaceBundlePayload,
} from "../../src/lib/valuation/workspace-bundle";

const sampleState = {
  version: 22,
  savedAt: "2026-08-24T10:00:00.000Z",
  periods: [],
};

test("workspace bundle round-trips every workspace with stable schema", () => {
  const payload = buildWorkspaceBundlePayload({
    sourceAppStorageVersion: 22,
    exportedAt: "2026-08-24T12:00:00.000Z",
    activeWorkspaceId: "workspace-a",
    workspaces: [
      {
        id: "workspace-a",
        name: "PT Alfa",
        createdAt: "2026-08-20T10:00:00.000Z",
        updatedAt: "2026-08-24T10:00:00.000Z",
        data: sampleState,
      },
      {
        id: "workspace-b",
        name: "PT Beta",
        createdAt: "2026-08-21T10:00:00.000Z",
        updatedAt: "2026-08-23T10:00:00.000Z",
        data: { ...sampleState, savedAt: "2026-08-23T10:00:00.000Z" },
      },
    ],
  });

  const parsed = parseWorkspaceBundlePayload(JSON.stringify(payload));

  assert.equal(parsed.schema, "penilaian-valuasi-bisnis.workspace-bundle");
  assert.equal(parsed.schemaVersion, 1);
  assert.equal(parsed.sourceAppStorageVersion, 22);
  assert.equal(parsed.activeWorkspaceId, "workspace-a");
  assert.deepEqual(parsed.workspaces.map((workspace) => workspace.name), ["PT Alfa", "PT Beta"]);
  assert.equal(buildWorkspaceBundleFilename(parsed.exportedAt), "penilaian-bisnis-semua-workspace-2026-08-24.json");
});

test("workspace bundle rejects duplicate IDs and a missing active workspace", () => {
  assert.throws(
    () =>
      buildWorkspaceBundlePayload({
        sourceAppStorageVersion: 22,
        exportedAt: "2026-08-24T12:00:00.000Z",
        activeWorkspaceId: "workspace-missing",
        workspaces: [
          {
            id: "workspace-a",
            name: "PT Alfa",
            createdAt: "",
            updatedAt: "",
            data: sampleState,
          },
        ],
      }),
    /Workspace aktif/,
  );

  assert.throws(
    () =>
      parseWorkspaceBundlePayload(
        JSON.stringify({
          schema: "penilaian-valuasi-bisnis.workspace-bundle",
          schemaVersion: 1,
          sourceAppStorageVersion: 22,
          exportedAt: "2026-08-24T12:00:00.000Z",
          activeWorkspaceId: "workspace-a",
          workspaces: [
            { id: "workspace-a", name: "PT Alfa", createdAt: "", updatedAt: "", data: sampleState },
            { id: "workspace-a", name: "PT Beta", createdAt: "", updatedAt: "", data: sampleState },
          ],
        }),
      ),
    /duplikat/,
  );
});
