import { useAppSelector } from "app/hooks";
import { RouterPath } from "app/router-path";

export function PageNotFound() {
  const session = useAppSelector((state) => state.session.session);
  return (
    <>
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ background: "#525252", height: "100vh" }}
      >
        <div className="text-center">
          <h1 className="display-1 fw-bold">404</h1>
          <p className="fs-3">
            {" "}
            <span className="text-danger">Opps!</span> Unknown Page.
          </p>
          <p className="lead text-light">
            The page you’re looking for doesn’t exist.
          </p>
          {!session ? (
            <p className="lead text-light">Maybe you want to login first?</p>
          ) : null}
          <a href="/" className="mx-3 btn btn-primary">
            Go Home
          </a>
          {!session ? (
            <a href={"/"+ RouterPath.login} className="mx-3 btn btn-primary">
              Login
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
