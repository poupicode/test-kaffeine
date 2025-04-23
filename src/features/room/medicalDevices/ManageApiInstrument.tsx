import { fetchAndSetMedicalDevices, fetchAndSetMedicalDeviceMeasurements } from 'actions/instruments-api';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { useEffect } from 'react';
import useInterval from 'use-interval';


export const ManageApiInstrument = () => {
  const dispatch = useAppDispatch();
  const medicalDevices = useAppSelector((state) => state.medicalDevices.medicalDevices);
  const apiInstrumentFetchEnabled = useAppSelector((state) => state.instrumentApi.instrumentAPICallsON);
  const apiFetchDelay = useAppSelector((state) => state.instrumentApi.delay);
  const userKind = useAppSelector((state) => state.user.userKind);
  
  // Fetch Medical Devices once on component mount if the API is enabled AND the user is a patient
  useEffect(() => {
    if(apiInstrumentFetchEnabled && userKind === "patient")
      dispatch(fetchAndSetMedicalDevices());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiInstrumentFetchEnabled, userKind]);
  
  useInterval(() => {
    // If API is enabled AND the user is a patient, fetch measurements for each medical device
    if(apiInstrumentFetchEnabled && userKind === "patient") {
        medicalDevices.forEach((medicalDevice, index) => {
            dispatch(fetchAndSetMedicalDeviceMeasurements(medicalDevice.id.toString()));
        });
    }
  }, apiFetchDelay); // passing null instead of 1000 will cancel the interval if it is already running

  return null;
}