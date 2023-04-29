import { useHistory } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LoginForm } from "@wasp/auth/forms/Login";
import { AuthWrapper } from "./AuthWrapper";
import useAuth from "@wasp/auth/useAuth";
import logo from "../static/logo.png";
import { appearance } from "./style";

export default function Login() {
  const history = useHistory();

  const { data: user } = useAuth();
  console.log("user: ", user);

  useEffect(() => {
    if (user) {
      history.replace("/");
    }
  }, [user, history]);

  return (
    <AuthWrapper>
      <LoginForm appearance={appearance} logo={logo} />
      <br />
      <span className="text-sm text-gray-900">
        Don't have an account yet?{" "}
        <Link
          to="/signup"
          className="text-indigo-500 font-medium hover:underline"
        >
          Sign up
        </Link>
      </span>
    </AuthWrapper>
  );
}
