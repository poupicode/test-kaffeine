import { useAppSelector } from "app/hooks";
import { Badge, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaNetworkWired } from "react-icons/fa";

export default function RTCConnectionStatus() {
    const iceGatheringState = useAppSelector((state) => state.rtcConnectionStatus).iceGatheringState;
    const connectionState = useAppSelector((state) => state.rtcConnectionStatus).connectionState;
    const signalingState = useAppSelector((state) => state.rtcConnectionStatus).signalingState;
    const iceConnectionState = useAppSelector((state) => state.rtcConnectionStatus).iceConnectionState;

    const renderTooltip = (text: string) => {
        return (
            <Tooltip id="button-tooltip">
                {text}
            </Tooltip>
        );
    };

    interface CustomOverlayTriggerProps {
        children: React.ReactElement<any, string | React.JSXElementConstructor<any>>,
        tooltip: string
    }

    const CustomOverlayTrigger = (props: CustomOverlayTriggerProps) => (
        <OverlayTrigger
            placement="bottom"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip(props.tooltip)}
        >
            {props.children}
            {/* <Button variant="success">Hover me to see</Button> */}
        </OverlayTrigger>
    );
    
    return (
        <>
            <Button variant={'outline-info'}>
                <FaNetworkWired />
                <CustomOverlayTrigger tooltip="ICE Gathering">
                    <Badge bg="primary">{iceGatheringState}</Badge>
                </CustomOverlayTrigger>
                <CustomOverlayTrigger tooltip="Connection State">
                    <Badge bg="secondary">{connectionState}</Badge>
                </CustomOverlayTrigger>
                <CustomOverlayTrigger tooltip="Signaling State">
                    <Badge bg="warning">{signalingState}</Badge>
                </CustomOverlayTrigger>
                <CustomOverlayTrigger tooltip="ICE Connection State">
                    <Badge bg="info">{iceConnectionState}</Badge>
                </CustomOverlayTrigger>
            </Button>
        <br />
        </>
    );
}