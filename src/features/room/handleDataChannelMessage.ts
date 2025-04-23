import { store } from "app/store";
import { messageAdded } from "features/chat/chat-slice";
import { medicalDevicesListUpdated, medicalDevicesMeasurementsUpdated } from "features/room/medicalDevices/medical-devices-slice";

// This function handles the different types of messages we can receive from the data channel and dispatch the appropriate action
export default function handleDataChannelMessage(event: MessageEvent) {
    // Message          : {type: "chatMessage", payload: ChatMessage}
    // Stream           : {type: "stream", payload: {stream: MediaStream}}
    // Instruments List : {type: "instrumentsList", payload: MedicalDevice[]}
    // Instruments Data : {type: "instrumentsData", payload: MedicalDeviceMeasurement}
  
    const message = JSON.parse(event.data);
    console.debug("Message received from data channel", message, message.type)
  
    switch (message.type) {
      case "chatMessage":
        store.dispatch(messageAdded(message.payload));
        break;
  
      // case "streamUpdate":
      //   console.debug("WIP", message.payload);
      //   Object.keys(message.payload).forEach((deviceType) => {
      //     console.debug("Device type", deviceType);
      //     console.debug("Stream", message.payload[deviceType]);
      //     console.debug("Stream ID", message.payload[deviceType].streamId);
      //     const newStreamDetails = {
      //       origin: "remote" as keyof StreamsState,
      //       deviceType: deviceType as keyof StreamsByDevice,
      //       streamDetails: {
      //         streamId: message.payload[deviceType].streamId,
      //       }
      //     };
  
      //     dispatch(streamUpdated(newStreamDetails));
      //   });
      //   break;
  
      case "instrumentsList":
        store.dispatch(medicalDevicesListUpdated(message.payload));
        break;
      case "instrumentsData":
        store.dispatch(medicalDevicesMeasurementsUpdated(message.payload));
        break;
      default:
        console.error("Unknown message type", message.type, message);
    }
  }