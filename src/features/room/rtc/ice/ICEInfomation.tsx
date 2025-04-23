import { useAppDispatch, useAppSelector } from "app/hooks";
import { CandidateObject } from "app/types";
import { iceConfigUpdated } from "features/room/rtc/ice/ice-config-slice";
import { useRef, useState } from "react";
import {
  Container,
  FormControl,
  Accordion,
  Spinner,
  Button,
  Alert,
  Tab,
  Tabs,
} from "react-bootstrap";

export function IceInformation() {
  const dispatch = useAppDispatch();
  const [change, setChange] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const iceConfInput = useRef<HTMLTextAreaElement>(null);
  const iceConf = useAppSelector((state) => state.iceConfig.iceConfig);
  const localIceCandidates = useAppSelector(
    (state) => state.iceConfig.iceCandidates
  );
  const remoteIceCandidates = useAppSelector(
    (state) => state.iceConfig.remoteIceCandidates
  );

  // Same function but for One CandidateObject
  const formatIceCandidate = (iceCandidate: CandidateObject | undefined) => {
    let iceCandidateString = "";
    if (!iceCandidate) {
      return iceCandidateString;
    }
    iceCandidateString += JSON.stringify(iceCandidate, null, 2) + "\r";
    return iceCandidateString;
  };

  // function to cut max length of string
  const cutString = (str: string | null) => {
    if (!str) {
      return "";
    }
    if (str.length > 15) {
      return str.substring(0, 15) + "...";
    }
    return str;
  };

  const updateIceConfig = () => {
    if (!iceConfInput.current) {
      setError(true);
      setErrorMessage("Text Area not found.");
      return;
    }

    if (
      iceConfInput.current.value === "" ||
      iceConfInput.current.value === null
    ) {
      setError(true);
      setErrorMessage("ICE Configuration is empty or null");
      return;
    }

    const newIceConfig = iceConfInput.current.value;

    // Check if it is a valid RTCConfiguration
    try {
      (new RTCPeerConnection(JSON.parse(newIceConfig))).close();
    } catch (error) {
      setError(true);
      setErrorMessage("Invalid ICE Configuration");
      return;
    }

    localStorage.setItem("iceConfig", newIceConfig);
    dispatch(iceConfigUpdated(JSON.parse(newIceConfig)));
    setChange(true);
    setError(false);
    setTimeout(() => {
      setChange(false);
    }, 5000);
  };

  function iceCandidatesAccordeon(
    header: string,
    iceCandidates: CandidateObject[]
  ) {
    return (
      <Accordion className="mt-2">
        <Accordion.Item eventKey="0" className="mt-2">
          <Accordion.Header>{header}</Accordion.Header>
          <Accordion.Body>
            <Accordion className="mt-2">
              {iceCandidates ? (
                iceCandidates.map(
                  (iceCandidate: CandidateObject, index: number) => {
                    return (
                      <Accordion.Item
                        eventKey={index.toString()}
                        className="mt-2"
                        key={index}
                      >
                        <Accordion.Header>
                          {cutString(iceCandidate.address)}
                        </Accordion.Header>
                        <Accordion.Body>
                          <FormControl
                            as="textarea"
                            rows={10}
                            value={formatIceCandidate(iceCandidate)}
                            readOnly
                          />
                        </Accordion.Body>
                      </Accordion.Item>
                    );
                  }
                )
              ) : (
                <div className="text-center">
                  <Spinner
                    as="span"
                    animation="grow"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="mx-2"
                  />
                  Waiting for Candidates...
                </div>
              )}
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  }

  function accordionOfIceCandidateAccordions(candidates: CandidateObject[] | undefined) {
    return candidates ? (
      <>
        {iceCandidatesAccordeon("All Ice Candidates", candidates)}
        {iceCandidatesAccordeon(
          "Host Ice Candidates",
          candidates.filter(
            (iceCandidate: CandidateObject) => iceCandidate.type === "host"
          )
        )}
        {iceCandidatesAccordeon(
          "Relay Ice Candidates",
          candidates.filter(
            (iceCandidate: CandidateObject) => iceCandidate.type === "relay"
          )
        )}
        {iceCandidatesAccordeon(
          "Server Reflective Ice Candidates",
          candidates.filter(
            (iceCandidate: CandidateObject) => iceCandidate.type === "srflx"
          )
        )}
        {iceCandidatesAccordeon(
          "Peer Reflective Ice Candidates",
          candidates.filter(
            (iceCandidate: CandidateObject) => iceCandidate.type === "prflx"
          )
        )}
      </>
    ) : null;
  }

  return (
    <Container>
      <h4>Ice Configuration</h4>
      <FormControl
        as="textarea"
        rows={10}
        defaultValue={JSON.stringify(iceConf, null, 2)}
        ref={iceConfInput}
      />
      {change ? (
        <Alert variant="success" className="mt-2">
          ICE Configuration Updated Successfully
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="danger" className="mt-2">
          Error Updating Ice Configuration : <strong>{errorMessage}</strong>
        </Alert>
      ) : null}
      <Button variant="primary" onClick={updateIceConfig} className="mt-2">
        Update
      </Button>
      <h4 className="mt-3">Ice Candidates</h4>

      {
        <Tabs
          defaultActiveKey="local"
          id="iceCandidates"
          className="mb-3"
        >
          <Tab eventKey="local" title="Local">
            {accordionOfIceCandidateAccordions(localIceCandidates)}
          </Tab>
          <Tab eventKey="remote" title="Remote">
            {accordionOfIceCandidateAccordions(remoteIceCandidates)}
          </Tab>
        </Tabs>
      }
    </Container>
  );
}
