import { Card, Spinner} from "react-bootstrap";

import { RootState } from "app/store";
import { firstLetterToUpperCase } from "utils/letterCasingHelper";
import { formatTime } from "utils/dateFormatter";
import { useAppSelector } from "app/hooks";

export function MedicalDeviceValues(props: { id: string }) {
    const medicalDevicesMeasurements = useAppSelector((state: RootState) => state.medicalDevices.medicalDevicesMeasurements);
    return (
        <>
            {medicalDevicesMeasurements.length > 0 ? medicalDevicesMeasurements.map((item, index) => {
                if (item.deviceId === props.id) {
                    return (
                        <div
                            aria-live="polite"
                            aria-atomic="true"
                            className="position-relative"
                            style={{ minHeight: "fit-content", marginLeft: "auto", marginRight: "auto", width: "100%" }}
                        >
                            <Card border="light" style={{ width: '100%' }}>
                                <Card.Header><strong>{firstLetterToUpperCase(item.measurement_type.toString())}</strong></Card.Header>
                                <Card.Body className="text-center">
                                    <Card.Title>{item.value.toString() + " " + item.unit.toString()}</Card.Title>
                                </Card.Body>
                                <Card.Footer className="text-muted text-center"><small>{formatTime(new Date(item.timestamp.toString()))}</small></Card.Footer>
                            </Card>
                        </div>
                    )
                }
                return null;
            }) : (<div className="text-center"><Spinner animation="border" className="text-centered" /></div>)
            }

        </>
    )
}