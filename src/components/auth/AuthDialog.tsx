import { useState } from "react";
import { Loader2, LogIn, UserPlus, X } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      if (mode === "login") await signIn(email, password);
      else await signUp(fullName, email, password);
      onClose();
    } catch (err: any) { setError(err?.message || "Authentication failed"); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <form onSubmit={submit} className="glass-strong relative w-full max-w-md rounded-3xl p-6 shadow-2xl sm:p-8">
      <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-white/10 hover:text-white"><X className="size-5" /></button>
      <p className="eyebrow">Your Voyage account</p>
      <h2 className="mt-2 text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">Save trips and keep your travel plans synced to your account.</p>
      <div className="mt-5 flex rounded-xl border border-border bg-surface/50 p-1">
        <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-lg py-2 text-sm ${mode === "login" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}>Sign in</button>
        <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-lg py-2 text-sm ${mode === "register" ? "bg-cyan/15 text-cyan" : "text-muted-foreground"}`}>Create account</button>
      </div>
      <div className="mt-5 space-y-4">
        {mode === "register" && <input required placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-base w-full" />}
        <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base w-full" />
        <input required minLength={6} type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="input-base w-full" />
      </div>
      {error && <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <button disabled={busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {busy ? <Loader2 className="size-4 animate-spin" /> : mode === "login" ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
        {mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  </div>;
}
