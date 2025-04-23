import { useAppSelector } from "app/hooks";
import { Badge, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { FaNetworkWired } from "react-icons/fa";

export default function SignalingStatus() {
  
  const renderTooltip = (text: string) => {
    return <Tooltip id="button-tooltip">{text}</Tooltip>;
  };

  interface CustomOverlayTriggerProps {
    children: React.ReactElement<
      any,
      string | React.JSXElementConstructor<any>
    >;
    tooltip: string;
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
      <Button variant={"outline-info"}>
        <FaNetworkWired />
        <CustomOverlayTrigger tooltip="Channel Subscription">
          <Badge bg="primary"></Badge>
        </CustomOverlayTrigger>
        <CustomOverlayTrigger tooltip="Presence Number">
          <Badge bg="secondary"></Badge>
        </CustomOverlayTrigger>
      </Button>
      <br />
    </>
  );
}
