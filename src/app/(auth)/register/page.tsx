import { RegisterForm } from "@/presentation/components/auth/register-form";
import { Film } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <Film className="h-7 w-7 text-rose-500" />
            <span className="font-[family-name:var(--font-syne)] text-2xl font-bold">
              SlideForge
            </span>
          </div>
          <p className="text-sm text-slate-400">Create your account</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
