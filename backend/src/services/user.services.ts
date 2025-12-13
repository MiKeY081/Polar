import { UserType } from "../interfaces/user.interface";
import { User } from "../models/user.model";

export default class UserServices {
    static findUserById = async (id: string): Promise<UserType | null> => {
        const user = (await User.findById(id)) as UserType;
        return user;
    };

    static findUserByEmail = async (email: string) => {
        const user = await User.findOne({ email }).select("+password");
        return user;
    };

    static createUser = async (data: {
        name: string;
        email: string;
        password?: string;
        profileImage?: string | null;
    }) => {
        const user = await User.create(data);
        return user;
    };
}
