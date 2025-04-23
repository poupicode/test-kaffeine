
import axios from "axios";

import { MedicalDevices, MedicalDevicesMeasurements, medicalDeviceMeasurementUpdated, medicalDevicesListUpdated } from "features/room/medicalDevices/medical-devices-slice";

import { store } from "app/store";
import { instrumentsApiErrorSet, instrumentsApiStatusOK  } from "features/api/instrument-api-slice";
import Ajv from "ajv";

const devicesJsonSchema = {
    "title": "Generated schema for Root",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "description": {
                "type": "string"
            },
            "type": {
                "type": "string"
            },
            "options": {
                "type": "object",
                "properties": {},
                "required": []
            },
            "id": {
                "type": "string"
            }
        },
        "required": [
            "description",
            "type",
            "options",
            "id"
        ]
    }
}

const measurementJsonSchema = {
    "title": "Generated schema for Root",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "measurement_type": {
                "type": "string"
            },
            "unit": {
                "type": "string"
            },
            "value": {
                "type": "number"
            },
            "timestamp": {
                "type": "string"
            },
            "id": {
                "type": "string"
            },
            "deviceId": {
                "type": "string"
            }
        },
        "required": [
            "measurement_type",
            "unit",
            "value",
            "timestamp",
            "id",
            "deviceId"
        ]
    }
}

const ajv = new Ajv();
// Validator for the devices JSON Schema
const devicesValidator = ajv.compile(devicesJsonSchema);
// Validator for the device measurements JSON Schema
const measurementValidator = ajv.compile(measurementJsonSchema);

// Initialising the state
let state = store.getState();
// Subscribe to the store to get the updated state
store.subscribe(() =>
    state = store.getState()
)

function getErrorMessage(error: unknown) {
    return (error instanceof Error)
        ? error.message
        : String(error)
}

// const validate = Ajv.compile(schema)
// const valid = validate(data)
// if (!valid) console.log(validate.errors)
export const fetchAndSetMedicalDevices = () => {
    // Thunk Function
    return async (dispatch: (arg0: { type: string; payload: any; }) => void, getState: any) => {
        try {
            // Fetching results from an API : asynchronous action
            const response = await axios.get(
                state.instrumentApi.baseUrl + state.instrumentApi.devicesUrl);
            const data : MedicalDevices = await response.data;
            
            // Check if the data is valid
            const valid = devicesValidator(data);
            // Dispatching the action when async
            // action has completed.
            if(valid) {
                dispatch(medicalDevicesListUpdated(data));
                dispatch(instrumentsApiStatusOK());
            }
            else if(!valid) {
                dispatch(instrumentsApiErrorSet({
                    error: "Invalid JSON Format for Devices",
                    message: `Received data: ${data}`,
                }));
            }    
        }
        catch (error) {
            dispatch(instrumentsApiErrorSet({
                error: "Axios Error: Cannot fetch devices",
                message: getErrorMessage(error)
            }));
        }
    }
}

export const fetchAndSetMedicalDeviceMeasurements = (id: string) => {
    // Thunk Function
    return async (dispatch: (arg0: { type: string; payload: any; }) => void, getState: any) => {
        try {
            // Fetching results from an API : asynchronous action
            const response = await axios.get(
                state.instrumentApi.baseUrl + state.instrumentApi.devicesUrl + id + state.instrumentApi.deviceMeasurementsUrl);
            const data = await response.data;

            // Check if the data is valid
            const valid = measurementValidator(data);
            // Dispatching the action when async
            // action has completed.
            if(valid) {
                dispatch(medicalDeviceMeasurementUpdated((data as MedicalDevicesMeasurements)[0]));
                dispatch(instrumentsApiStatusOK())
            }
            else if(!valid) {
                dispatch(instrumentsApiErrorSet({
                    error: "Invalid JSON Format for Measurements",
                    message: `Received data: ${data}`
                }));
            }
            
        }
        catch (error) {
            console.log(error);
            // Dispatch the error string to the store
            dispatch(instrumentsApiErrorSet({
                error: "Axios Error: Cannot fetch measurements",
                message: getErrorMessage(error)
            }));
        }
    }
}