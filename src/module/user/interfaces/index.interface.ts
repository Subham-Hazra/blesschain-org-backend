export interface User {
    _id: string;
    email: string,
    name: string;
    image: string,
    mobile: string;
    password: string;
    role?: string;
    is_online?: number;
    socket_id?: string;
    createdAt?: Date;
    deleted: boolean;
    deletedAt?: Date;
    token?: string;
    r_token?: string;
    activeStatus?: string;
    added_by?: string;
}
export interface CreateUser extends User {
    file?: File & {
        filename: string,
        originalname: string,
        encoding: string,
        mimetype: string,
        buffer: Buffer
    };
}



