import { model, Schema, Document } from 'mongoose';
import { User } from '@/module/user/interfaces/index.interface';

const chatSchema: Schema = new Schema({
    
    sender_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },

    receiver_id: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    text: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        required: false,
    },
    deleted: {
        type: Boolean,
        default: false
    },
    sent: {
        type: Boolean,
        default: false
    },
    received: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    },
    deletedAt: {
        type: Date,
        default: null
    },
}, {
    timestamps: true
});

const chatModel = model<User & Document>('Chats', chatSchema);

export default chatModel;
