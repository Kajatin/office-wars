import { ReactNode } from "react";

export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col mx-4 sm:w-fit justify-center">
      <div className="py-8 px-4 rounded sm:px-10">{children}</div>
    </div>
  );
}
