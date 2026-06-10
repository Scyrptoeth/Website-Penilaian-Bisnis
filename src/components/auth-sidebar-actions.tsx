"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronDown, FileText, KeyRound, LogOut, X } from "lucide-react";
import { PasswordVisibilityInput } from "./password-visibility-input";
import { SuperAdminUserManagement } from "./super-admin-user-management";

type AuthSidebarActionsProps = {
  userId: string;
  isSuperAdmin?: boolean;
  includeManual?: boolean;
};

type ActionStatus = {
  type: "error" | "success";
  message: string;
} | null;

const userManualOptions = [
  {
    label: "Penilaian AAM + EEM + DCF",
    description: "Panduan lengkap untuk tiga metode",
    methods: ["AAM", "EEM", "DCF"],
    href: "/buku-panduan-penilaian-aam-eem-dcf.pdf",
  },
  {
    label: "Penilaian AAM",
    description: "Asset-based approach",
    methods: ["AAM"],
    href: "/buku-panduan-penilaian-aam.pdf",
  },
  {
    label: "Penilaian EEM",
    description: "Excess earnings method",
    methods: ["EEM"],
    href: "/buku-panduan-penilaian-eem.pdf",
  },
  {
    label: "Penilaian DCF",
    description: "Discounted cash flow",
    methods: ["DCF"],
    href: "/buku-panduan-penilaian-dcf.pdf",
  },
] as const;

export function UserManualMenu() {
  const [isManualMenuOpen, setIsManualMenuOpen] = useState(false);
  const manualMenuRef = useRef<HTMLDivElement>(null);
  const manualPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isManualMenuOpen) {
      return;
    }

    window.requestAnimationFrame(() => {
      manualPanelRef.current?.scrollIntoView({ block: "nearest" });
    });

    function handlePointerDown(event: PointerEvent) {
      if (!manualMenuRef.current?.contains(event.target as Node)) {
        setIsManualMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsManualMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isManualMenuOpen]);

  return (
    <div className="manual-menu" ref={manualMenuRef}>
      <button
        className="auth-nav-action manual"
        type="button"
        aria-label="Buku Panduan"
        aria-haspopup="menu"
        aria-expanded={isManualMenuOpen}
        onClick={() => setIsManualMenuOpen((isOpen) => !isOpen)}
      >
        <BookOpen size={14} aria-hidden="true" />
        <span>Buku Panduan</span>
        <ChevronDown size={13} aria-hidden="true" />
      </button>
      {isManualMenuOpen ? (
        <div className="manual-menu-panel" role="menu" aria-label="Pilihan Buku Panduan" ref={manualPanelRef}>
          {userManualOptions.map((option) => (
            <a
              className="manual-menu-item"
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              aria-label={`${option.label}. ${option.description}. Buka PDF di tab baru.`}
              onClick={() => setIsManualMenuOpen(false)}
              key={option.href}
            >
              <span className="manual-menu-icon" aria-hidden="true">
                <FileText size={13} aria-hidden="true" />
              </span>
              <span className="manual-menu-copy">
                <span className="manual-menu-title">{option.label}</span>
                <span className="manual-menu-description">{option.description}</span>
                <span className="manual-menu-methods" aria-label={`Cakupan metode ${option.methods.join(", ")}`}>
                  {option.methods.map((method) => (
                    <span className={`manual-method-badge method-${method.toLowerCase()}`} key={method}>
                      {method}
                    </span>
                  ))}
                </span>
              </span>
              <span className="manual-menu-filetype" aria-hidden="true">
                PDF
              </span>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function AuthSidebarActions({ userId, isSuperAdmin = false, includeManual = true }: AuthSidebarActionsProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<ActionStatus>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.refresh();
    });
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "Konfirmasi password baru tidak sama." });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 64) {
      setStatus({ type: "error", message: "Password baru harus terdiri dari 6 sampai 64 karakter." });
      return;
    }

    if (newPassword === userId) {
      setStatus({ type: "error", message: "Password baru tidak boleh sama dengan NIP Pendek." });
      return;
    }

    setIsSubmitting(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    setIsSubmitting(false);

    if (!response.ok) {
      setStatus({ type: "error", message: payload?.message ?? "Password belum berhasil diganti." });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setStatus({ type: "success", message: "Password berhasil diganti. Password baru sudah dapat digunakan untuk login berikutnya." });
  }

  return (
    <div className="auth-sidebar-actions">
      <p className="auth-user-chip">Login sebagai {userId}</p>
      {includeManual ? <UserManualMenu /> : null}
      <button className="auth-nav-action" type="button" aria-label="Ganti Password" onClick={() => {
        setStatus(null);
        setIsDialogOpen(true);
      }}>
        <KeyRound size={14} aria-hidden="true" />
        <span>Ganti Password</span>
      </button>
      {isSuperAdmin ? <SuperAdminUserManagement currentUserId={userId} /> : null}
      <button className="auth-nav-action danger" type="button" onClick={handleLogout} disabled={isPending} aria-label="Keluar">
        <LogOut size={14} aria-hidden="true" />
        <span>{isPending ? "Keluar..." : "Keluar"}</span>
      </button>

      {isDialogOpen && isMounted ? createPortal(renderPasswordDialog(), document.body) : null}
    </div>
  );

  function renderPasswordDialog() {
    return (
      <div className="auth-dialog-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsDialogOpen(false);
        }
      }}>
        <section className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
          <div className="auth-dialog-heading">
            <div>
              <p className="eyebrow">Keamanan Akun</p>
              <h2 id="change-password-title">Ganti Password</h2>
            </div>
            <button
              className="icon-button"
              type="button"
              onClick={() => setIsDialogOpen(false)}
              aria-label="Tutup dialog ganti password"
              title="Tutup"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
          <form className="auth-dialog-form" onSubmit={handlePasswordChange}>
            <PasswordVisibilityInput
              id="current-password"
              label="Password saat ini"
              value={currentPassword}
              onChange={setCurrentPassword}
              autoComplete="current-password"
              required
            />
            <PasswordVisibilityInput
              id="new-password"
              label="Password baru"
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              placeholder="6-64 karakter"
              required
            />
            <PasswordVisibilityInput
              id="confirm-password"
              label="Konfirmasi password baru"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              required
            />
            <p className="auth-dialog-note">Password baru tidak harus angka, tetapi tidak boleh sama dengan NIP Pendek.</p>
            {status ? <p className={`auth-status ${status.type}`}>{status.message}</p> : null}
            <div className="auth-dialog-actions">
              <button className="button ghost" type="button" onClick={() => setIsDialogOpen(false)}>
                Tutup
              </button>
              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }
}
