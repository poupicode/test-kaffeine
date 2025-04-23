import { SupabaseClient } from "@supabase/supabase-js";
import { Room } from "app/types";

export class RoomSupabase {
    private supabaseClient: SupabaseClient;
    private roomId: string = "";

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    private makeRoomObject(dbRoom: any) : Room {
        return {
            id: dbRoom.id,
        }
    }

    public async getAllRooms() : Promise<Room[]> {
        const {data, error} = await this.supabaseClient.from('rooms').select('*');
        if (error) {
            throw error;
        }

        if (!data) {
            return [];
        }

        return data.map((dbRoom) => {
            return this.makeRoomObject(dbRoom);
        });
    }

    public async setRoom(roomId: string) : Promise<Room> {
        // Check if room exists using .single()
        const { data, error } = await this.supabaseClient
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (error) {
            throw error;
        }

        this.roomId = roomId;

        return this.makeRoomObject(data);
    }

    public async getRoom(roomId: string) : Promise<Room> {
        const { data, error } = await this.supabaseClient
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
    
        if (error) {
            throw error;
        }
    
        return this.makeRoomObject(data);
    }
    
    public async createRoom() : Promise<Room> {
        const { data, error } = await this.supabaseClient.from('rooms').insert({}).select();
    
        if (error) {
            throw error;
        }

        if (data) {
            this.roomId = data[0].id;

            return this.makeRoomObject(data[0]);
        } else {
            throw new Error('Could not create room');
        }
    
    }
    
    // public async updateRoom(roomId: string, room: Room) {
    //     const { data, error } = await this.supabaseClient
    //     .from('rooms')
    //     .update(room)
    //     .eq('id', roomId);
    
    //     if (error) {
    //     throw error;
    //     }
    
    //     return data;
    // }
}