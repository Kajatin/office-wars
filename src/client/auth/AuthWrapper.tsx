import { ReactNode } from "react";

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col w-screen mx-4 sm:w-fit h-screen justify-center">
      <div className="py-8 px-4 rounded sm:px-10">{children}</div>
    </div>
  );
}
