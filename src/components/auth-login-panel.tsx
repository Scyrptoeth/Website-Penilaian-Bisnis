"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, ShieldCheck } from "lucide-react";
import { PasswordVisibilityInput } from "./password-visibility-input";

type LoginStatus = {
  type: "error" | "info";
  message: string;
} | null;

export function AuthLoginPanel() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<LoginStatus>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password }),
    });
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setStatus({
        type: "error",
        message: payload?.message ?? "Login belum berhasil. Periksa kembali NIP Pendek dan Password Pengguna.",
      });
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <main className="auth-login-shell" data-testid="auth-login-panel">
      <section className="auth-login-panel" aria-labelledby="auth-login-title">
        <div className="auth-login-copy">
          <div className="auth-login-brand">
            <span className="brand-mark">B-2</span>
            <div>
              <p className="eyebrow">Akses Terbatas Penilai Pajak</p>
              <h1 id="auth-login-title">Penilaian Bisnis II</h1>
            </div>
          </div>
          <p className="auth-login-lede">
            Masuk menggunakan NIP Pendek dan Password Pengguna yang sudah terdaftar untuk membuka aplikasi.
          </p>
          <div className="auth-info-list" aria-label="Informasi login">
            <div>
              <BadgeCheck size={16} />
              <p>ID Pengguna memakai NIP Pendek Pegawai. Password awal memakai 8 digit angka dari NIP Panjang Pegawai.</p>
            </div>
            <div>
              <ShieldCheck size={16} />
              <p>
                Login hanya memverifikasi akses Penilai Pajak. Data penilaian tetap aman dan privat karena proses kerja
                tersimpan lokal di perangkat Bapak/Ibu.
              </p>
            </div>
            <div>
              <ShieldCheck size={16} />
              <p>
                Password dapat diganti setelah berhasil login. Jika lupa password, hubungi 0822-9411-6001
                (Goradok Pande Raja Sinabutar).
              </p>
            </div>
          </div>
        </div>

        <form className="auth-login-form" onSubmit={handleSubmit}>
          <div className="auth-form-heading">
            <p className="eyebrow">Login</p>
            <h2>Verifikasi Pengguna</h2>
          </div>
          <label className="auth-field" htmlFor="auth-user-id">
            <span>NIP Pendek</span>
            <input
              id="auth-user-id"
              type="text"
              inputMode="numeric"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <PasswordVisibilityInput
            id="auth-password"
            label="Password Pengguna"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            required
          />
          {status ? <p className={`auth-status ${status.type}`}>{status.message}</p> : null}
          <button className="button primary auth-submit-button" type="submit" disabled={isPending}>
            <span>{isPending ? "Membuka aplikasi..." : "Masuk"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      </section>
    </main>
  );
}
