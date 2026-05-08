"use client";

import { FormEvent, useEffect, useId, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { RefreshCw, ShieldCheck, Trash2, UserPlus, UsersRound, X } from "lucide-react";
import { PasswordVisibilityInput } from "./password-visibility-input";

type ManagedUser = {
  userId: string;
  role: "user" | "super_admin";
  isActive: boolean;
  hasDefaultPassword: boolean;
  passwordSeededAt: string | null;
  passwordChangedAt: string | null;
  passwordUpdatedAt: string | null;
};

type UserListPayload = {
  users?: ManagedUser[];
  message?: string;
};

type ActionPayload = {
  message?: string;
  signedOutCurrentSession?: boolean;
};

type ActionStatus = {
  type: "error" | "success";
  message: string;
} | null;

type SuperAdminUserManagementProps = {
  currentUserId: string;
};

export function SuperAdminUserManagement({ currentUserId }: SuperAdminUserManagementProps) {
  const router = useRouter();
  const titleId = useId();
  const userIdInputId = useId();
  const passwordInputId = useId();
  const [isMounted, setIsMounted] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [newUserId, setNewUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState<ActionStatus>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [activeActionUserId, setActiveActionUserId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function openDialog() {
    setStatus(null);
    setIsDialogOpen(true);
    await loadUsers();
  }

  async function loadUsers() {
    setIsLoadingUsers(true);
    let response: Response;

    try {
      response = await fetch("/api/admin/users", { method: "GET" });
    } catch {
      setIsLoadingUsers(false);
      setStatus({ type: "error", message: "Daftar pengguna belum dapat dimuat." });
      return;
    }

    const payload = (await response.json().catch(() => null)) as UserListPayload | null;
    setIsLoadingUsers(false);

    if (!response.ok) {
      setStatus({ type: "error", message: payload?.message ?? "Daftar pengguna belum dapat dimuat." });
      return;
    }

    setUsers(payload?.users ?? []);
  }

  async function handleCreateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setActiveActionUserId("create");

    let response: Response;

    try {
      response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: newUserId, password: newPassword }),
      });
    } catch {
      setActiveActionUserId(null);
      setStatus({ type: "error", message: "Pengguna belum berhasil ditambahkan." });
      return;
    }

    const payload = (await response.json().catch(() => null)) as ActionPayload | null;
    setActiveActionUserId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: payload?.message ?? "Pengguna belum berhasil ditambahkan." });
      return;
    }

    setNewUserId("");
    setNewPassword("");
    setStatus({ type: "success", message: "Pengguna berhasil ditambahkan atau diaktifkan kembali." });
    await loadUsers();
  }

  async function handleResetPassword(user: ManagedUser) {
    if (!window.confirm(`Reset password pengguna ${user.userId} ke default?`)) {
      return;
    }

    setStatus(null);
    setActiveActionUserId(`reset:${user.userId}`);
    let response: Response;

    try {
      response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}/reset-password`, { method: "POST" });
    } catch {
      setActiveActionUserId(null);
      setStatus({ type: "error", message: "Password belum berhasil di-reset." });
      return;
    }

    const payload = (await response.json().catch(() => null)) as ActionPayload | null;
    setActiveActionUserId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: payload?.message ?? "Password belum berhasil di-reset." });
      return;
    }

    setStatus({ type: "success", message: `Password ${user.userId} berhasil dikembalikan ke default.` });
    await loadUsers();

    if (payload?.signedOutCurrentSession) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  async function handleDeactivateUser(user: ManagedUser) {
    if (!window.confirm(`Nonaktifkan pengguna ${user.userId}?`)) {
      return;
    }

    setStatus(null);
    setActiveActionUserId(`deactivate:${user.userId}`);
    let response: Response;

    try {
      response = await fetch(`/api/admin/users/${encodeURIComponent(user.userId)}/deactivate`, { method: "POST" });
    } catch {
      setActiveActionUserId(null);
      setStatus({ type: "error", message: "Pengguna belum berhasil dinonaktifkan." });
      return;
    }

    const payload = (await response.json().catch(() => null)) as ActionPayload | null;
    setActiveActionUserId(null);

    if (!response.ok) {
      setStatus({ type: "error", message: payload?.message ?? "Pengguna belum berhasil dinonaktifkan." });
      return;
    }

    setStatus({ type: "success", message: `Pengguna ${user.userId} berhasil dinonaktifkan.` });
    await loadUsers();
  }

  return (
    <>
      <button className="auth-nav-action" type="button" onClick={openDialog} aria-label="Kelola Pengguna">
        <UsersRound size={14} />
        <span>Kelola Pengguna</span>
      </button>

      {isDialogOpen && isMounted ? createPortal(renderDialog(), document.body) : null}
    </>
  );

  function renderDialog() {
    return (
      <div
        className="auth-dialog-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setIsDialogOpen(false);
          }
        }}
      >
        <section className="auth-dialog super-admin-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <div className="auth-dialog-heading">
            <div>
              <p className="eyebrow">SuperAdmin</p>
              <h2 id={titleId}>Kelola Pengguna</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsDialogOpen(false)}
              aria-label="Tutup dialog kelola pengguna"
              title="Tutup"
            >
              <X size={16} />
            </button>
          </div>

          <form className="admin-user-create-form" onSubmit={handleCreateUser}>
            <label className="auth-field" htmlFor={userIdInputId}>
              <span>NIP Pendek / ID Pengguna</span>
              <input
                id={userIdInputId}
                type="text"
                value={newUserId}
                onChange={(event) => setNewUserId(event.target.value)}
                autoComplete="off"
                required
              />
            </label>
            <PasswordVisibilityInput
              id={passwordInputId}
              label="Password awal"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              placeholder="6-64 karakter"
              required
            />
            <button className="button secondary" type="submit" disabled={activeActionUserId === "create"}>
              <UserPlus size={14} />
              <span>{activeActionUserId === "create" ? "Menyimpan..." : "Tambah Pengguna"}</span>
            </button>
          </form>

          {status ? <p className={`auth-status ${status.type}`}>{status.message}</p> : null}

          <div className="admin-user-toolbar">
            <button className="button ghost compact-button" type="button" onClick={loadUsers} disabled={isLoadingUsers || isPending}>
              <RefreshCw size={13} />
              <span>{isLoadingUsers ? "Memuat..." : "Refresh"}</span>
            </button>
          </div>

          <div className="admin-user-table-wrap">
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>Pengguna</th>
                  <th>Status</th>
                  <th>Password</th>
                  <th>Update</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5}>{isLoadingUsers ? "Memuat daftar pengguna..." : "Belum ada pengguna yang dapat ditampilkan."}</td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelf = user.userId === currentUserId;
                    const isSuperAdmin = user.role === "super_admin";
                    const resetActionId = `reset:${user.userId}`;
                    const deactivateActionId = `deactivate:${user.userId}`;

                    return (
                      <tr key={user.userId}>
                        <td>
                          <div className="admin-user-identity">
                            <strong>{user.userId}</strong>
                            {isSuperAdmin ? (
                              <span>
                                <ShieldCheck size={12} />
                                SuperAdmin
                              </span>
                            ) : (
                              <span>User</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`admin-user-status ${user.isActive ? "active" : "inactive"}`}>
                            {user.isActive ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td>{user.hasDefaultPassword ? "Default tersedia" : "Default belum ada"}</td>
                        <td>{formatDateTime(user.passwordUpdatedAt)}</td>
                        <td>
                          <div className="admin-user-actions">
                            <button
                              className="button ghost compact-button"
                              type="button"
                              onClick={() => handleResetPassword(user)}
                              disabled={!user.isActive || !user.hasDefaultPassword || activeActionUserId === resetActionId}
                            >
                              <RefreshCw size={12} />
                              <span>{activeActionUserId === resetActionId ? "Reset..." : "Reset"}</span>
                            </button>
                            <button
                              className="button danger compact-button"
                              type="button"
                              onClick={() => handleDeactivateUser(user)}
                              disabled={!user.isActive || isSelf || isSuperAdmin || activeActionUserId === deactivateActionId}
                            >
                              <Trash2 size={12} />
                              <span>{activeActionUserId === deactivateActionId ? "Hapus..." : "Hapus"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
