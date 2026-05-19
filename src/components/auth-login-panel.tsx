"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, KeyRound, LockKeyhole, MessageCircle, RefreshCw, ShieldCheck } from "lucide-react";
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
              <p className="eyebrow">Akses Terbatas</p>
              <strong>Penilai Pajak</strong>
            </div>
          </div>
          <h1 id="auth-login-title" aria-label="Platform Digital Penilaian Bisnis II">
            <span>Platform Digital</span>
            <span>Penilaian Bisnis II</span>
          </h1>
          <div className="auth-info-list" aria-label="Informasi login">
            <div>
              <BadgeCheck size={16} />
              <p>Tidak perlu membuat Akun Baru untuk login, sebab Akun telah disediakan dan bisa langsung login.</p>
            </div>
            <div>
              <KeyRound size={16} />
              <p>Gunakan 8 digit angka pertama dari NIP Panjang sebagai Password ketika pertama kali login.</p>
            </div>
            <div>
              <RefreshCw size={16} />
              <p>Bapak/Ibu dapat mengganti Password setelah berhasil login.</p>
            </div>
            <div>
              <ShieldCheck size={16} />
              <p>Proses login hanya bertujuan untuk memverifikasi bahwa Bapak/Ibu adalah Penilai Pajak aktif.</p>
            </div>
            <div>
              <LockKeyhole size={16} />
              <p>Data Penilaian tetap 100% aman dan privat karena seluruh proses tersimpan secara lokal di perangkat Bapak/Ibu.</p>
            </div>
            <div>
              <MessageCircle size={16} />
              <p>
                Klik nomor WA berikut{" "}
                <a href="https://wa.me/6282294116001" target="_blank" rel="noreferrer">
                  0822-9411-6001
                </a>{" "}
                (Goradok Pande Raja Sinabutar) apabila lupa password.
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
