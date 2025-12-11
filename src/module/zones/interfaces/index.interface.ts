export interface Zone {
    _id: string;
    name: string;
    description: string;
    boundaries: any;
    createdAt?: Date;
    deleted: boolean;
    deletedAt?: Date;
    added_by?: string;
}
export interface CreateZone extends Zone {
     
}



