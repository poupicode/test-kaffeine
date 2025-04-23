import { useAppDispatch, useAppSelector } from "app/hooks";
import {
  instrumentAPICallsONUpdated,
  instrumentsApiStatusOK,
  instrumentApiStatusDisconnected,
  apiFetchingDelayUpdated,
  baseUrlUpdated,
  devicesUrlUpdated,
  deviceMeasurementsUrlUpdated,
} from "features/api/instrument-api-slice";
import { useRef } from "react";
import {
  Button,
  Card,
  Form,
  FormControl,
  FormLabel,
  InputGroup,
} from "react-bootstrap";
import FormRange from "react-bootstrap/esm/FormRange";

export function SettingsCard() {
  const dispatch = useAppDispatch();

  const apiInstrumentCallsSwitch = useRef<HTMLInputElement>(null);
  const apiDelayRange = useRef<HTMLInputElement>(null);
  const apiBaseUrlInput = useRef<HTMLInputElement>(null);
  const apiDevicesUrlInput = useRef<HTMLInputElement>(null);
  const apiDeviceMeasurementsUrlInput = useRef<HTMLInputElement>(null);

  const apiFetchDelay = useAppSelector((state) => state.instrumentApi.delay);
  const apiBaseUrl = useAppSelector((state) => state.instrumentApi.baseUrl);
  const apiDevicesUrl = useAppSelector(
    (state) => state.instrumentApi.devicesUrl
  );
  const apiDeviceMeasurementsUrl = useAppSelector(
    (state) => state.instrumentApi.deviceMeasurementsUrl
  );

  const apiInstrumentCallsEnabled = useAppSelector(
    (state) => state.instrumentApi.instrumentAPICallsON
  );

  const userKind = useAppSelector((state) => state.user.userKind);

  const handleInstrumentApiCallsSwitchChange = () => {
    dispatch(
      instrumentAPICallsONUpdated(
        apiInstrumentCallsSwitch.current?.checked as boolean
      )
    );
    // Dispatch instrumentsApiStatusOK or instrumentApiStatusDisconnected action depending on the switch being on or off
    if (apiInstrumentCallsSwitch.current?.checked as boolean)
      dispatch(instrumentsApiStatusOK());
    else dispatch(instrumentApiStatusDisconnected());
  };

  const handleDelayChange = () => {
    const delay = (apiDelayRange.current as HTMLInputElement).value;
    dispatch(apiFetchingDelayUpdated(parseInt(delay)));
  };

  const handleBaseUrlChange = () => {
    dispatch(baseUrlUpdated(apiBaseUrlInput.current?.value as string));
  };

  const handleDevicesUrlChange = () => {
    dispatch(devicesUrlUpdated(apiDevicesUrlInput.current?.value as string));
  };

  const handleDeviceMeasurementsUrlChange = () => {
    dispatch(
      deviceMeasurementsUrlUpdated(
        apiDeviceMeasurementsUrlInput.current?.value as string
      )
    );
  };
  return (
    <Card border="light">
      <Card.Header>
        <h2>Settings</h2>
      </Card.Header>
      <Card.Body>
        {userKind === "patient" ? (
          <>
            <h4 className="h5">Api Settings</h4>
            <InputGroup className="mb-3">
              <div className="form-floating">
                <FormControl
                  ref={apiBaseUrlInput}
                  id="apiBaseUrl"
                  placeholder="Base Url"
                  defaultValue={apiBaseUrl}
                />
                <FormLabel htmlFor="apiBaseUrl">API Base Url</FormLabel>
              </div>
              <Button variant="primary" onClick={handleBaseUrlChange}>
                Save
              </Button>
            </InputGroup>
            <InputGroup className="mb-3">
              <div className="form-floating">
                <FormControl
                  ref={apiDevicesUrlInput}
                  placeholder="Devices URL"
                  defaultValue={apiDevicesUrl}
                />
                <FormLabel htmlFor="apiBaseUrl">Devices URL</FormLabel>
              </div>
              <div className="form-floating">
                <FormControl
                  id="deviceId"
                  disabled={true}
                  defaultValue={"deviceId ( string )"}
                ></FormControl>
                <FormLabel htmlFor="deviceId">Devices ID</FormLabel>
              </div>
              <Button variant="primary" onClick={handleDevicesUrlChange}>
                Save
              </Button>
            </InputGroup>
            <InputGroup className="mb-3">
              <div className="form-floating">
                <FormControl
                  ref={apiDeviceMeasurementsUrlInput}
                  placeholder="Measurement URL"
                  defaultValue={apiDeviceMeasurementsUrl}
                />
                <FormLabel htmlFor="apiBaseUrl">Measurement URL</FormLabel>
              </div>
              <Button
                variant="primary"
                onClick={handleDeviceMeasurementsUrlChange}
              >
                Save
              </Button>
            </InputGroup>
            <p className="text-muted">
              Current URL :{" "}
              {apiBaseUrl +
                apiDevicesUrl +
                "deviceId" +
                apiDeviceMeasurementsUrl}
            </p>
            <Form.Check
              defaultChecked={apiInstrumentCallsEnabled}
              type="switch"
              id="instrumentApiSwitch"
              label="Enable Instrument API Calls"
              className="mb-3"
              ref={apiInstrumentCallsSwitch}
              onChange={handleInstrumentApiCallsSwitchChange}
            />

            <FormLabel htmlFor="delayRange">
              Fetch Delay {"(2s to 10s)"}
            </FormLabel>
            <FormRange
              ref={apiDelayRange}
              id="delayRange"
              min={2000}
              max={10000}
              step={1000}
              defaultValue={apiFetchDelay}
              onChange={() => {
                handleDelayChange();
              }}
            ></FormRange>
            <p className="text-muted">Current Delay: {apiFetchDelay} ms</p>
          </>
        ) : (
          "Coming Soon"
        )}
      </Card.Body>
    </Card>
  );
}
