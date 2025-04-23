import { Navbar, Container, Nav } from "react-bootstrap";

import { MinimalAPIStatus } from "features/room/medicalDevices/MinimalAPIStatus";
import { MenuDropDown } from "components/MenuDropDown";
import { RouterPath } from "app/router-path";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { IceInformationButton } from "features/room/rtc/ice/IceInformationButton";
import { supabase } from "app/supabaseClient";
import { userCreated } from "features/auth/user/user-slice";



export function NavBar() {
  const session = useAppSelector((state) => state.session.session);
  const userKind = useAppSelector((state) => state.user.userKind);
  const dispatch = useAppDispatch();

  const onLogoutClick = () => {
    supabase.auth.signOut();
    dispatch(userCreated({ name: "", id: "", userKind: "guest" }));
  };

  const USER_MENU_CONTENT = (session) 
    ? [
      {
        title: "Profile",
        href: "/" + RouterPath.account,
        children: null
      },
      {
        title: "Settings",
        href: "/" + RouterPath.settings,
        children: null
      },
      {
        separator: true,
        className: "text-danger",
        title: "Log Out",
        onClick: onLogoutClick,
        children: null
      },
    ]
    : [
      {
        title: "Sign In/Up",
        href: "/" + RouterPath.login,
        children: null,
      }
    ]; // USER_MENU_CONTENT  


  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href={"/" + RouterPath.home}>
          <img
            alt=""
            src="EKAMI Logomark.png"
            width="30"
            height="30"
            className="d-inline-block align-top mx-3"
            style={{ filter: "hue-rotate(205deg) invert(1) saturate(10)" }}
          />
          <span>Teleconsultation Demo</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href={"/" + RouterPath.home}>Home</Nav.Link>
            {session ? (
              <Nav.Link href={"/" + RouterPath.consultationRoom}>
                Room
              </Nav.Link>
            ) : null}
          </Nav>
          {session ? (
            <Nav>
              <IceInformationButton></IceInformationButton>
            </Nav>
          ) : null}
          {session && userKind === "patient" ? (
            <Nav>
              <MinimalAPIStatus />
            </Nav>
          ) : null}
          {/* {session ? (
            <Nav>
              <RTCConnectionStatus />
            </Nav>
          ) : null} */}
          <Nav>
            <MenuDropDown menuContent={USER_MENU_CONTENT} />
          </Nav>

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
