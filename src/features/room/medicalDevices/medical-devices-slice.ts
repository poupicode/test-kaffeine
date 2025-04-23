import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type MedicalDevice = { "description": string, "type": string, "options": {}, "id": number };
export type MedicalDevices = MedicalDevice[];
export type MedicalDeviceMeasurement = {
    measurement_type: string;
    unit: string;
    value: number;
    timestamp: Date;
    id: string;
    deviceId: string;
}

export type MedicalDevicesMeasurements = MedicalDeviceMeasurement[];

const initialState = { medicalDevices: [] as MedicalDevices, medicalDevicesMeasurements: [] as MedicalDevicesMeasurements };

// Reminder : We should NOT use axios here, because reducers should be pure functions
export const medicalDevicesSlice = createSlice({
    name: 'medicalDevices',
    initialState,
    reducers: {
        medicalDevicesListUpdated: (state, action: PayloadAction<MedicalDevices>) => {
            // Add the new devices to the list if they don't exist
            action.payload.forEach((medicalDevice) => {
                if (!state.medicalDevices.some((medicalDeviceInList) => medicalDeviceInList.id === medicalDevice.id)) {
                    state.medicalDevices.push(medicalDevice);
                }
            });
            //state.medicalDevices = action.payload;
        },
        medicalDeviceUpdated: (state, action: PayloadAction<MedicalDevice>) => {
            state.medicalDevices = state.medicalDevices.map((medicalDevice) => {
                if (medicalDevice.id === action.payload.id) {
                    return action.payload;
                }
                return medicalDevice;
            });
        },
        medicalDeviceMeasurementUpdated: (state, action: PayloadAction<MedicalDeviceMeasurement>) => {
            let newLocalMedicalDevicesMeasurements = state.medicalDevicesMeasurements;
            state.medicalDevicesMeasurements = [] as MedicalDevicesMeasurements;

            // Push the new measurement to the list if it doesn't exist
            if (!state.medicalDevicesMeasurements.some((medicalDeviceMeasurement) => medicalDeviceMeasurement.id === action.payload.id)) {
                newLocalMedicalDevicesMeasurements.push(action.payload);
            }
            // Delete the measurement if it exists and add the new one
            newLocalMedicalDevicesMeasurements = newLocalMedicalDevicesMeasurements.filter((medicalDeviceMeasurement) => medicalDeviceMeasurement.id !== action.payload.id);
            newLocalMedicalDevicesMeasurements.push(action.payload);

            // Change the state to the new list
            state.medicalDevicesMeasurements = newLocalMedicalDevicesMeasurements;
        },
        medicalDevicesMeasurementsUpdated: (state, action: PayloadAction<MedicalDevicesMeasurements>) => {
            state.medicalDevicesMeasurements = action.payload;
        }
    }
});

export const { medicalDevicesListUpdated, medicalDeviceUpdated, medicalDeviceMeasurementUpdated, medicalDevicesMeasurementsUpdated } = medicalDevicesSlice.actions;

export default medicalDevicesSlice.reducer;