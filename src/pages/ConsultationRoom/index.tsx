// Page not foud
import { PageNotFound } from "pages/NotFound/PageNotFound";

// UI components
import { Accordion, Col, Container, Row } from "react-bootstrap";
import { ChatBox } from "features/chat/ChatBox";
import { RefreshDeviceButton } from "features/room/mediaDevices/RefreshDevicesButton";
import { ConsultationRoom } from "features/room/ConsultationRoom";
import { VideoDeviceSelector } from "features/room/mediaDevices/VideoDeviceSelector";
import { VideoThumbnail } from "components/VideoThumbnail";
import { MedicalDevicesList } from "features/room/medicalDevices/MedicalDevicesList";
import { Settings } from "features/settings/Settings";

// redux
import { useAppSelector } from "app/hooks";

export function ConsultationRoomPage() {
  const session = useAppSelector((state) => state.session.session);
  const userKind = useAppSelector((state) => state.user.userKind);
  const streamIds = {
    localCamera: useAppSelector((state) => state.streams.local.camera?.streamId),
    localInstrument: useAppSelector((state) => state.streams.local.instrument?.streamId),
    remoteCamera: useAppSelector((state) => state.streams.remote.camera?.streamId),
    remoteInstrument: useAppSelector((state) => state.streams.remote.instrument?.streamId),
    selectedStream: useAppSelector((state) => state.selectedStream.streamId),
  };

  if (!session) return <PageNotFound />;

  return (
    <>
      <Container fluid>
        <Row>
          <Col xs={3} className="mt-3 menu-column">
            <Accordion className="mb-3 text-center" defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header><strong>Video Sources</strong></Accordion.Header>
                <Accordion.Body>
                  <Row className="mb-3">
                    <Col>
                      <h6>Local Camera</h6>
                      <VideoThumbnail
                        streamid={streamIds.localCamera}
                        muted
                        autoPlay
                        style={{ maxWidth: "100%" }}
                      />
                      <VideoDeviceSelector deviceType="camera"></VideoDeviceSelector>
                    </Col>
                    <Col>
                      <h6>Local Instrument</h6>
                      <VideoThumbnail
                        streamid={streamIds.localInstrument}
                        muted
                        autoPlay
                        style={{ maxWidth: "100%" }}
                      />
                      <VideoDeviceSelector deviceType="instrument"></VideoDeviceSelector>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col>
                      <h6>Remote Camera</h6>
                      <VideoThumbnail
                        streamid={streamIds.remoteCamera}
                        autoPlay
                        style={{ maxWidth: "100%" }}
                      ></VideoThumbnail>
                    </Col>
                    <Col>
                      <h6>Remote Instrument</h6>
                      <VideoThumbnail
                        streamid={streamIds.remoteInstrument}
                        muted
                        autoPlay
                        style={{ maxWidth: "100%" }}
                      ></VideoThumbnail>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <RefreshDeviceButton></RefreshDeviceButton>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col xs={6}>
            <Row className="mb-3">
              <VideoThumbnail
                streamid={streamIds.selectedStream}
                muted
                style={{
                  maxWidth: "100%",
                }}
              />
            </Row>
          </Col>
          <Col className="mt-3 menu-column">
            {userKind === "patient" ? (
              <Row className="mb-3">
                <Col>
                  <Settings></Settings>
                </Col>
              </Row>
            ) : null}
            <Row className="mb-3">
              <Col>
                <Container className="mt-2">
                  <ConsultationRoom />
                </Container>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <ChatBox />
                <MedicalDevicesList></MedicalDevicesList>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
}
