import { SignUp } from "@clerk/nextjs";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function Page() {
  return (
    <div className="flex justify-center items-center bg-lime-50 dark:bg-stone-950 min-h-screen">
      <SignUp />
    </div>
  );
}
