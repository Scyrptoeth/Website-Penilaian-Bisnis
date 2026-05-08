import { NextResponse } from "next/server";
import { type SuperAdminAuthResult } from "./admin";

export function adminAuthFailureResponse(authResult: SuperAdminAuthResult): NextResponse | null {
  switch (authResult.status) {
    case "ok":
      return null;
    case "unconfigured":
      return NextResponse.json({ message: "Database login belum terhubung. Hubungi administrator aplikasi." }, { status: 503 });
    case "unauthenticated":
      return NextResponse.json({ message: "Sesi login sudah berakhir. Silakan login ulang." }, { status: 401 });
    case "forbidden":
      return NextResponse.json({ message: "Akses SuperAdmin diperlukan untuk mengelola pengguna." }, { status: 403 });
  }
}

export async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
