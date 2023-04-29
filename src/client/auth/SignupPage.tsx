import { Link } from "react-router-dom";
import { SignupForm } from "@wasp/auth/forms/Signup";
import { AuthWrapper } from "./AuthWrapper";
import logo from "../static/logo.png";
import { appearance } from "./style";

export default function SignupPage() {
  return (
    <AuthWrapper>
      <SignupForm appearance={appearance} logo={logo} />
      <br />
      <span className="text-sm text-gray-900">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-indigo-500 font-medium hover:underline"
        >
          Sign in
        </Link>{" "}
        instead.
      </span>
    </AuthWrapper>
  );
}
