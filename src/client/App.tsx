import "./Main.css";
import { ReactNode } from "react";

export default function App({ children }: { children: ReactNode }) {
  return <div className="flex justify-center py-8">{children}</div>;
}
