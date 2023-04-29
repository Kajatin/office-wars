import "./Main.css";
import { ReactNode } from "react";

export default function App({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-center place-content-center w-screen h-screen">
      {children}
    </div>
  );
}
