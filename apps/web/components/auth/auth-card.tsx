import Link from "next/link";
import { Chrome, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AUTH_COPY } from "@/lib/auth";

interface AuthCardProps {
  mode: "login" | "register";
}

export function AuthCard({ mode }: AuthCardProps) {
  const isLogin = mode === "login";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="border-b border-border">
        <CardTitle>{isLogin ? "Masuk" : "Daftar"}</CardTitle>
        <p className="text-sm text-slate-400">
          {isLogin ? AUTH_COPY.loginTitle : AUTH_COPY.registerTitle}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {!isLogin ? (
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-300">Nama lengkap</span>
            <Input placeholder="Nama Anda" />
          </label>
        ) : null}
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Email</span>
          <Input type="email" placeholder="contoh@email.com" />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-300">Password</span>
          <Input type="password" placeholder="Minimal 8 karakter" />
        </label>
        <Button className="w-full">
          <Mail className="h-4 w-4" />
          {isLogin ? "Masuk" : "Buat Akun"}
        </Button>
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
            Phase 1 UI statis
          </div>
          {AUTH_COPY.noAuthYet}
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
