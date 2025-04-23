import { useAppSelector } from "app/hooks";
import { LoginRegister } from "features/auth/user/LoginRegister";
import { Navigate } from "react-router-dom";

export default function Login() {
  const session = useAppSelector((state) => state.session.session);
  return (
    <div style={{ padding: "200px" }}>
      { session ? <Navigate to="/" /> : null}
      <LoginRegister></LoginRegister>
    </div>
    // We can use the Auth component from @supabase/auth-ui-react
    // <Auth
    //   supabaseClient={supabase}
    //   appearance={{ theme: ThemeSupa }}
    //   redirectTo={`/`}
    // />
  );
}
