import { useEffect, useState } from "react";
import { Container, Card, Button, Offcanvas } from "react-bootstrap";
import { Room } from "app/types";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { FaCog, FaWindowClose } from "react-icons/fa";

import { RoomList } from "./RoomList";
import { useAppSelector } from "app/hooks";
import { supabase } from "app/supabaseClient";


// MUST REVIEW
// NO DETAILED SUPABASE CODE SHOULD BE HERE. NEED MORE ABSTRACTION.
// RELY ON REDUX INSTEAD ?

export function RoomBrowser() {
  const [rooms, setRooms] = useState<Array<Room>>([]);
  const [show, setShow] = useState(false);
  const userKind = useAppSelector((state) => state.user.userKind);

  async function listenForRoomsChanges() {
    supabase
      .channel("table-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
        },
        async (payload) => {
          const rooms: Array<Room> = [];
          try {
            const { data, error } = await supabase.from("rooms").select();
            if (data && data !== rooms) {
              setRooms([]);
              // console.log("Rooms data", data);
              data.forEach((room) => {
                rooms.push({
                  id: room.id,
                  ...room,
                } as Room);
              });
            }
            if (error) throw error;
            setRooms(rooms);
          } catch (error) {
            console.error("error", error);
          }
        }
      )
      .subscribe();
  }

  async function updateRoomsListFromSupabase() {
    console.debug("RoomBrowser - Updating rooms from supabase");
    const rooms: Array<Room> = [];
    try {
      const { data, error } = await supabase.from("rooms").select();
      if (data && data !== rooms) {
        setRooms([]);
        // console.log("Rooms data", data);
        data.forEach((room) => {
          rooms.push({
            id: room.id,
            ...room,
          } as Room);
        });
        setRooms(rooms);
      }
      if (error) {
        console.log("Rooms error", error);
      }
    } catch (error) {
      console.log("Rooms error", error);
    }
  }

  async function deleteAllRoomsFromSupabase() {
    console.debug("Deleting all rooms");
    // DELETE ALL ROOMS
    await supabase.from("rooms").delete().neq('id', "2f36f4b6-aefb-11ed-afa1-0242ac120002");
  }

  useEffect(() => {
    console.debug("Room browser mounted");

    // Get rooms from database, add their id to the room object, and set them to state
    console.debug("  - Updating room list from db");
    updateRoomsListFromSupabase();
    // Listen for changes to rooms in database, and update state
    console.debug("  - Subscribing to room updates");
    listenForRoomsChanges();
  }, []);

  // Delete room from database
  async function deleteAllRoomsAlert() {
    confirmAlert({
      title: "Delete all rooms",
      message: "Are you sure you want to delete all rooms?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            console.log("TEST");
            deleteAllRoomsFromSupabase();
          },
        },
        {
          label: "No",
          onClick: () => {},
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
    });
  }

  useEffect(() => {
    console.log("Rooms", rooms);
  }, [rooms]);

  return (
    <Container>
      {userKind === "practitioner" ? (
        <>
          <div className="d-flex flex-row-reverse">
            <Button onClick={() => setShow(true)} variant="outline-secondary">
              <FaCog color="Black" size={"20px"} />
            </Button>
          </div>
          <Offcanvas show={show} placement="end" backdrop={false} scroll={true}>
            <Card>
              <Card.Header>
                <h2>
                  <FaWindowClose
                    size={"25px"}
                    className="me-3 hover-pointer"
                    onClick={() => setShow(false)}
                  />
                  Manage Rooms
                </h2>
              </Card.Header>
              <Card.Body>
                <RoomList />
              </Card.Body>
              <Card.Footer>
                <Button
                  variant="danger"
                  className="mx-2"
                  onClick={deleteAllRoomsAlert}
                >
                  Delete all rooms
                </Button>
                {/* <Button variant="primary" className="mx-2" onClick={updateRoomListGroupFromDb}>Refresh</Button> */}
              </Card.Footer>
            </Card>
          </Offcanvas>
        </>
      ) : null}
    </Container>
  );
}
