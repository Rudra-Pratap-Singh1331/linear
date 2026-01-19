"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import LinearLogo from "@/component/LinearLogo";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AuthEmailComponent from "@/component/AuthEmailComponent";

export default function LoginPage() {
  const supabase = useSupabase();
  const router = useRouter();
  const [buttonActive, isButtonActive] = useState(" "); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined"
              ? `${window.location.origin}/auth/callback`
              : undefined,
        },
      });

      if (signInError) {
        throw signInError;
      }
    } catch (err) {
      setError(
        err?.message || "Unable to sign in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailContinue = () => {
    if (isLoading) return;
    isButtonActive("email");
  };

  const handleSamlSso = async () => {
    setError(null);
    setIsLoading(true);
    if (typeof window !== "undefined") {
      window.alert("SSO authentication started");
    }

    try {
      await supabase.auth.signInWithSSO({});
    } catch (err) {
      setError(
        err?.message || "Unable to start SSO authentication. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-[#0f1011] to-[#060606] text-[#ededed] flex items-center justify-center px-4">
      <div className={`w-full max-w-[384px] flex flex-col items-center text-center px-4  
       ${buttonActive=="email"? `mt-[-106px] `: `mt-19`} animate-[fade-slide-down_0.6s_cubic-bezier(0.16,1,0.3,1)_both]`}>
        <LinearLogo className="h-12 w-12 text-[#ededed] mb-7.5" />

        {buttonActive === "email" ? <AuthEmailComponent buttonActive={buttonActive} isButtonActive={isButtonActive} mode="login"/> : <>
          <h1 className="font-medium text-[17.8px] tracking-normal text-[#d4d4d5]">
          Log in to Linear
        </h1>

          {/* Google button + helper text */}
          <div className="w-[288px] mt-[21px]">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="group relative inline-flex w-full h-12 items-center justify-center gap-2 rounded-[6px] border border-[#656fc7] bg-[rgb(87,91,199)] px-[14px] text-[13px] text-[#fefeff] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.043)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7aff] focus-visible:ring-offset-2 focus-visible:ring-offset-black hover:bg-[#6a6af0] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="flex h-5 w-5 font-medium items-center justify-center rounded-full bg-white  text-xs text-[#5b5bd6]">
                <FontAwesomeIcon icon={faGoogle} className="h-1 w-1 bg-none" />
              </div>
              <span className="font-medium">Continue with Google</span>
              {isLoading && (
                <span
                  className="absolute right-4 h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
                  aria-hidden="true"
                />
              )}
            </button>

            <p className="mt-[11px] text-[13px] text-[#919294] font-medium">
              You used Google to log in last time
            </p>
          </div>

          {/* Email + SAML buttons */}
          <div className="w-[288px] mt-[22px] space-y-4">
            <button
              type="button"
              onClick={handleEmailContinue}
              disabled={isLoading}
              className="inline-flex w-full font-sans h-12 items-center justify-center rounded-[6px] border border-[#2c2e33] bg-[#1e2025] px-[14px] text-[13px] font-medium text-[#d6d6d6] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.043)] transition hover:bg-[#2e3139c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7aff] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with email
            </button>

            <button
              type="button"
              onClick={handleSamlSso}
              disabled={isLoading}
              className="inline-flex font-sans w-full h-12 items-center justify-center rounded-[6px] border border-[#2c2e33] bg-[#1e2025] px-[14px] text-[13px] font-medium text-[#d6d6d6] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.043)] transition hover:bg-[#2e3139c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7aff] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Continue with SAML SSO
            </button>
            <button
              type="button"
              onClick={handleSamlSso}
              disabled={isLoading}
              className="inline-flex font-sans w-full h-12 items-center justify-center rounded-[6px] border border-[#2c2e33] bg-[#1e2025] px-[14px] text-[13px] font-medium text-[#d6d6d6] shadow-[0_3px_6px_-2px_rgba(0,0,0,0.02),0_1px_1px_0_rgba(0,0,0,0.043)] transition hover:bg-[#2e3139c7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7a7aff] focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              Log in with Passkey
            </button>
          </div>

          {error && (
            <p
              className="mt-4 w-[288px] text-xs text-red-400/90"
              role="status"
              aria-live="polite"
            >
              {error}
            </p>
          )}

          <p className=" font-sans mt-6 w-[288px] text-[13px] text-[#858181] font-medium">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/signup")}
              className="text-gray-100  font-medium hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#7a7aff] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              Sign up
            </button>
          </p>
        </>}
      </div>
    </div>
  );
}
