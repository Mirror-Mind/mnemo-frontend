"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { IconCrown } from "@tabler/icons-react";

interface LoginModalProps {
  children: React.ReactNode;
}

export function LoginModal({ children }: LoginModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
              <IconCrown className="h-4 w-4 text-amber-600" />
            </div>
            Summon the Goddess
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Access your divine memory assistant. Login to begin your journey with Mnemo.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <LoginForm />
        </div>
      </DialogContent>
    </Dialog>
  );
} 