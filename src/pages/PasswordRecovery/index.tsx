import { useAppSelector } from "app/hooks";
import { PasswordRecovery } from "features/auth/user/PasswordRecovery";
import { PageNotFound } from "pages/NotFound/PageNotFound";
// import { PageNotFound } from "pages/NotFound/PageNotFound";

export function PasswordRecoveryPage() {
  const passwordRecovery = useAppSelector(
    (state) => state.session.passwordRecovery
  );
  return (
    <>
      {passwordRecovery ? (
        <div style={{ padding: "200px" }}>
          <PasswordRecovery></PasswordRecovery>
        </div>
      ) : <PageNotFound></PageNotFound>}
    </>
  );
}
