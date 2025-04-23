import { useAppSelector } from "app/hooks";
import { Alert, Button, OverlayTrigger, Popover } from "react-bootstrap";
import { formatTime } from "utils/dateFormatter";
import { AiFillApi } from "react-icons/ai";

export function MinimalAPIStatus() {

    const APIStatus = useAppSelector((state) => state.instrumentApi.apiStatus);
    const lastInstrumentApiError = useAppSelector((state) => state.instrumentApi.instrumentsApiError);

    const status = () => {
        switch (APIStatus) {
            case "CONNECTED":
                return "🟢";
            case "DISCONNECTED":
                return "🟡";
            case "ERROR":
                return "🔴";
            default:
                return "\u20dd?"; // Unicode character for a question mark in a circle
        }
    };

    const bootstrapAlertVariant = () => {
        switch (APIStatus) {
            case "CONNECTED":
                return "success";
            case "DISCONNECTED":
                return "warning";
            case "ERROR":
                return "danger";
            default:
                return "danger";
        }
    }

    // This function return a string that will be displayed in the alert if the API is connected or disconnected but not in error
    const errorApiStatus = () => {
        switch (APIStatus) {
            case "CONNECTED":
                return "No error";
            case "DISCONNECTED":
                return "Not connected to API";
            default:
                return "Unknown status";
        }
    }

    return (
        <>
            <OverlayTrigger
                trigger="click"
                key={'bottom'}
                placement={'bottom'}
                overlay={
                    <Popover id={`popover-positioned-bottom`}>
                        <Popover.Header as="h3">Last Error</Popover.Header>
                        <Popover.Body>
                            <>
                                {lastInstrumentApiError.error !== ""
                                    ? <Alert className="danger" variant="danger">
                                        <p>
                                            <strong>{lastInstrumentApiError.error}</strong><br />
                                            {formatTime(new Date(lastInstrumentApiError.timestamp as string))}
                                        </p>
                                        <p>{lastInstrumentApiError.message}</p>
                                    </Alert>
                                    : <Alert className="success" variant={bootstrapAlertVariant()}>{errorApiStatus()}</Alert>
                                }
                            </>
                        </Popover.Body>
                    </Popover>
                }
            >
                <Button variant={'outline-' + bootstrapAlertVariant()}>
                    <span className="text-light">
                        <AiFillApi />
                    </span>{status()}
                </Button>
            </OverlayTrigger>
        </>
    );
}