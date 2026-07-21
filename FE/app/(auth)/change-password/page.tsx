"use client";

import { FormButton } from "@/components/ui/form";
import { RHFInput } from "@/components/ui/form/RhfFields";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function ChangePasswordPage() {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="rounded-2xl bg-[#081326] border border-[#16294A] p-6 sm:p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
            Change password
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
            Enter your current password and your new password.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Old Password Input */}
          <RHFInput
            control={control}
            name="oldPassword"
            type="password"
            placeholder="Current password"
            leftIcon={<Lock size={16} />}
          />

          {/* New Password Input */}
          <RHFInput
            control={control}
            name="newPassword"
            type="password"
            placeholder="New password"
            leftIcon={<Lock size={16} />}
          />

          {/* Submit Button */}
          <FormButton
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            className="mt-6"
          >
            CHANGE PASSWORD
          </FormButton>

          <p className="text-center text-xs text-slate-400 pt-1">
            <Link href="/login" className="text-[#F4B942] font-semibold hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
