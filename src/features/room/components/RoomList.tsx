import { useEffect, useState, useRef} from "react";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import { Room } from "app/types";
import "firebase/firestore";
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaPhone } from "react-icons/fa";


import { useAppDispatch } from "app/hooks";
import { roomIdUpdated } from "features/room/room-slice";
import { supabase } from "app/supabaseClient";


// MUST REVIEW
// NO CODE RELATED TO SUPABASE SHOULD BE HERE

export function RoomList() {
    const dispatch = useAppDispatch();
    const roomListGroup = useRef<HTMLDivElement>(null);
    const [rooms, setRooms] = useState<Array<Room>>([]);

    async function updateRoomsListFromSupabase() {
        console.debug("Updating rooms from supabase");
        const rooms: Array<Room> = [];
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select()
            if(data && data !== rooms) {
                setRooms([]);
                // console.log('Rooms data', data);
                data.forEach((room) => {
                    rooms.push({
                        id: room.id,
                        ...room,
                    } as Room);
                });
                setRooms(rooms);
            }
            if(error) {
                console.error('Rooms error', error);
            }
        } catch (error) {
            console.error('Rooms error', error);
        }
    }

    useEffect(() => {
        console.debug("Room browser mounted");
        updateRoomsListFromSupabase();
        supabase
            .channel('table-db-changes')
            .on(
                'postgres_changes',
                {
                event: '*',
                schema: 'public',
                table: 'rooms',
                },
                (payload) => {
                    updateRoomsListFromSupabase();
                }
            )
            .subscribe();
    }, []);
        


    return (
        <ListGroup className="mb-2" style={{ maxHeight: "20vh", overflowY: "scroll"}} ref={roomListGroup}>
            {rooms.length !== 0 ?
                rooms.map((room, index )=> {
                    return (
                        <ListGroupItem key={room.id} variant={(index%2)?"":"secondary"} className="hover-pointer" onClick={
                            () => {
                                console.debug("Clicked on call button for room " + room.id);
                                dispatch(roomIdUpdated(room.id));
                            }
                        }>
                            <FaPhone size={"20px"} className="me-3" color="DarkGreen" />
                            {room.id}
                        </ListGroupItem>
                    ); 
                }) : <ListGroupItem>No rooms available</ListGroupItem>
                }
            
        </ListGroup>
    );
}