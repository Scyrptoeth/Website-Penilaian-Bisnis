import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const defaultPreviewFixturePath = join(
  process.env.HOME ?? "",
  "Desktop",
  "codex",
  "penilaian-bisnis",
  "screenshot-koreksi",
  "penilaian-bisnis-pt-tuwa-tuwa-maju-mapan-12125758-2026-05-21.json",
);

const previewFixtures = {
  tuwa: process.env.PVB_PREVIEW_FIXTURE_PATH ?? defaultPreviewFixturePath,
} as const;

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fixtureName = url.searchParams.get("name");
  const host = getHostname(request.headers.get("host") ?? "");

  if (process.env.NODE_ENV !== "development" || !localHosts.has(host)) {
    return NextResponse.json({ message: "Preview fixture is only available in local development." }, { status: 404 });
  }

  if (fixtureName !== "tuwa") {
    return NextResponse.json({ message: "Unknown preview fixture." }, { status: 404 });
  }

  try {
    const rawJson = await readFile(previewFixtures[fixtureName], "utf8");

    return new Response(rawJson, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ message: "Preview fixture file was not found." }, { status: 404 });
  }
}

function getHostname(hostHeader: string): string {
  if (hostHeader.startsWith("[")) {
    return hostHeader.slice(1, hostHeader.indexOf("]"));
  }

  return hostHeader.split(":")[0] ?? "";
}
