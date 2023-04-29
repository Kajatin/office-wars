import { User } from "@wasp/entities";
import logout from "@wasp/auth/logout";

export default function MainPage({ user }: { user: User }) {
  console.log("user: ", user);

  return (
    <div>
      <span>Hello World!</span>
      <br />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
