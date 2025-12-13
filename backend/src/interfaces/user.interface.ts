import { Document } from "mongoose";

export interface UserType extends Document {
    name: string;
    email: string;
    password: string;
    accountType: string;
    profileImage: string;
    coverImage: string;
}

export interface UserRequestPayload {
    name: string;
    email: string;
    password: string;
}
