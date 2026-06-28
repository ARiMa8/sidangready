"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Chrome, Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/lib/api";
import { AUTH_COPY, storeAuthSession } from "@/lib/auth";

interface AuthCardProps {
  mode: "login" | "register";
}

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!isLogin) {
        await api.register({ name, email, password });
      }
      const session = await api.login({ email, password });
      storeAuthSession(session.access_token, session.user);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Tidak dapat terhubung ke backend. Pastikan API sedang berjalan.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="border-b border-border">
        <CardTitle>{isLogin ? "Masuk" : "Daftar"}</CardTitle>
        <p className="text-sm text-slate-400">
          {isLogin ? AUTH_COPY.loginTitle : AUTH_COPY.registerTitle}
        </p>
      </CardHeader>
      <CardContent className="p-5">
        <form className="space-y-4" onSubmit={handleSubmit}>
        {!isLogin ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Nama lengkap</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama Anda"
              required={!isLogin}
              minLength={2}
            />
          </label>
        ) : null}
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="contoh@email.com"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Password</span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimal 8 karakter"
            required
            minLength={8}
          />
        </label>
        {error ? (
          <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3 text-sm leading-6 text-rose-100">
            {error}
          </div>
        ) : null}
        <Button className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {isLogin ? "Masuk" : "Buat Akun"}
        </Button>
        </form>
        <div className="relative py-1 text-center text-xs text-slate-500">
          <span className="bg-card px-2">atau</span>
          <div className="absolute left-0 right-0 top-1/2 -z-10 border-t border-border" />
        </div>
        <Button className="w-full" variant="secondary" disabled>
          <Chrome className="h-4 w-4" />
          Google belum aktif
        </Button>
        <div className="rounded-md border border-border bg-slate-950/45 p-3 text-xs leading-5 text-slate-500">
          <div className="mb-1 flex items-center gap-2 text-slate-300">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            API backend aktif
          </div>
          {AUTH_COPY.authActive}
        </div>
        <p className="text-center text-sm text-slate-400">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <Link
            className="font-medium text-indigo-300 hover:text-indigo-200"
            href={isLogin ? "/register" : "/login"}
          >
            {isLogin ? "Daftar di sini" : "Masuk di sini"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
