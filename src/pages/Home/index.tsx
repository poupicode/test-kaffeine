import { Button, Col, Container, Row } from "react-bootstrap";

import "./home.scss";
import { RouterPath } from "app/router-path";
import { useAppSelector } from "app/hooks";

export function Home() {
  const session = useAppSelector((state) => state.session.session);
  const userKind = useAppSelector((state) => state.user.userKind);
  const userName = useAppSelector((state) => state.user.name);

  return (
    <>
      <Container id="home">
        <Row>
          <Col>
            <img
              src="./Espace Lab Logo.png"
              alt="Espace Lab Logo"
              height="100vh"
            ></img>
          </Col>
          <Col>
            <img
              src="./EKAMI Logo Horizontal Large vector.svg"
              alt="EKAMI Logo"
              height="100vh"
            ></img>
          </Col>
        </Row>

        <Row>
          <Col>
            <h1>Teleconsultation Demo</h1>
            <h3>Welcome {userName}!</h3>
            {userKind === "practitioner" && session ? (
              <p>
                <strong>You are a practitioner.</strong>
              </p>
            ) : userKind === "patient" && session ? (
              <p>
                <strong>You are a patient.</strong>
              </p>
            ) : (
              <p>
                <strong>You are not logged in.</strong>
              </p>
            )}
          </Col>
        </Row>

        <Row id="buttons">
          <Col>
            {session ? (
              <Button
                href={"/" + RouterPath.consultationRoom}
                variant="primary"
              >
                Room
              </Button>
            ) : (
              <Button href={"/" + RouterPath.login} variant="primary">
                Login
              </Button>
            )}
          </Col>
        </Row>

        <Row>
          <Col />
          <Col id="website-description" className="col-8">
            <p>
              Teleconsultation Demo is a web application that allows users to
              connect to each other via video and audio, using standard and
              open-source technologies. It aims at demonstrating our ability to:
            </p>
            <ul>
              <li>
                Run a peer-to-peer telecommunciation between a patient and a
                medical practitioner
              </li>
              <li>
                Simultanously transmit several audio, video and data streams
              </li>
              <li>
                Not rely on any third-party services, except for barebone server
                hosting (ie. no reliance on any specific cloud or SaaS
                provider).
              </li>
            </ul>

            <p>
              It is not meant to be a fully-fledged teleconsultation
              application, but rather a proof of concept.
            </p>

            <p>
              To run this demonstration, 2 instances, each with a different
              profile, need to be running at the same time:
            </p>
            <ol>
              <li>
                A medical practioner, who will create the virtual consultation
                room
              </li>
              <li>A patient, who will join the room</li>
            </ol>
          </Col>
          <Col />
        </Row>
      </Container>
    </>
  );
}
