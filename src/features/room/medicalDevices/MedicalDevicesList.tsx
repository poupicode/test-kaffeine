import { useAppSelector } from "app/hooks";
import { Accordion, Alert, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { MedicalDeviceValues } from "./MedicalDeviceValues";
import { RefreshMedicalDevicesButton } from "./RefreshMedicalDevicesButton";
import CardHeader from "react-bootstrap/esm/CardHeader";
import { GiMedicalThermometer } from "react-icons/gi";
import { SiOxygen } from "react-icons/si";
import { BiDevices } from "react-icons/bi";
import { ImDroplet } from "react-icons/im";
import { firstLetterToUpperCase } from "utils/letterCasingHelper";

export function MedicalDevicesList() {
  const medicalDevices = useAppSelector(
    (state) => state.medicalDevices.medicalDevices
  );
  const instrumentAPICallsON = useAppSelector(
    (state) => state.instrumentApi.instrumentAPICallsON
  );

  const userKind = useAppSelector((state) => state.user.userKind);

  const medicalDeviceIcon = (type: string) => {
    console.debug("Medical Device Type : " + type);
    switch (type) {
      case "THERMOMETER":
        return <GiMedicalThermometer />;
      case "OXIMETER":
        return <SiOxygen />;
      case "BLOOD PRESSURE MONITOR":
        return <ImDroplet />;
      default:
        return <BiDevices />;
    }
  };

  return (
    <Container>
      <Card className="mt-2">
        <CardHeader>Medical Devices</CardHeader>
        <Card.Body>
          {medicalDevices.map((item, index) => {
            return (
              <Accordion className="mb-2">
                <Accordion.Item eventKey={index.toString()}>
                  <Accordion.Header>
                    <Col xs={2} className="text-primary">
                      {medicalDeviceIcon(item.description.toUpperCase())}
                    </Col>
                    <Col className="">
                      <Row>
                        {firstLetterToUpperCase(item.description)} ({item.id}){" "}
                      </Row>
                      <Row>{firstLetterToUpperCase(item.type)}</Row>
                    </Col>
                  </Accordion.Header>
                  <Accordion.Body>
                    <MedicalDeviceValues
                      id={item.id.toString()}
                    ></MedicalDeviceValues>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            );
          })}
          {!instrumentAPICallsON && userKind === "patient" ? (
            <Alert variant="warning">
              Medical Instruments Fetching is disabled. Please Enable it in the
              settings to get the medical devices.
            </Alert>
          ) : null}
          {medicalDevices.length === 0 ? (
            <div className="text-center">
              <Spinner
                as="span"
                animation="grow"
                size="sm"
                role="status"
                aria-hidden="true"
                className="mx-2"
              />
              Waiting for medical devices...
            </div>
          ) : null}
        </Card.Body>
        <Card.Footer>
          <RefreshMedicalDevicesButton></RefreshMedicalDevicesButton>
        </Card.Footer>
      </Card>
    </Container>
  );
}
