"use client";

import { FormLabel, FormInput, FormTextarea, FormButton } from "@/app/components/ui/FormElements";

export default function BasicInfoPage() {
  return (
    <form className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-3">
        <FormLabel>Full Name</FormLabel>
        <FormInput placeholder="Enter your name" />
      </div>

      <div className="flex flex-col gap-3">
        <FormLabel>Bio</FormLabel>
        <FormTextarea rows={6} placeholder="Share your story..." />
      </div>

      <div className="pt-8">
        <FormButton>Save Profile</FormButton>
      </div>
    </form>
  );
}