import { ProfileStep } from "@/components/features/onboarding/ProfileStep";

export default function OnboardingProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-16 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <ProfileStep />
      </div>
    </div>
  );
}
