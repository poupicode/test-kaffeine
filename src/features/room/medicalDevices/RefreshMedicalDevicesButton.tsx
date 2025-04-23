import { fetchAndSetMedicalDevices } from "actions/instruments-api";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { Button } from "react-bootstrap";
import { BiRefresh } from "react-icons/bi";

export function RefreshMedicalDevicesButton() {
    const dispatch = useAppDispatch();
    const apiEnabled = useAppSelector((state) => state.instrumentApi.instrumentAPICallsON);

    const handleRefreshButtonClick = () => {
        if(apiEnabled)
            dispatch(fetchAndSetMedicalDevices());
    }

    return (
        <Button onClick={handleRefreshButtonClick} disabled={!apiEnabled}><BiRefresh></BiRefresh> Refresh List</Button>
    );
}