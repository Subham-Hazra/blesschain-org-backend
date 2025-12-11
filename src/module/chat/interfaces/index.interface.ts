export interface Chats {
    _id: string;
    sender_id?: string;
    receiver_id: string,
    text: string;
    image: string, 
    deleted: boolean;
    sent: boolean;
    received: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
 
  
}
export interface CreateChats extends Chats {
    file?: File & {
        filename: string,
        originalname: string,
        encoding: string,
        mimetype: string,
        buffer: Buffer
    };
}



