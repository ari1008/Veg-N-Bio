import api from "../api.ts";
import type {CreateUser} from "./dto/createUserDto.ts";
import type { LoginDto} from "./dto/loginDto.ts";

export const postCreateUser = async (createUser: CreateUser) => {
    const response = await api.post('/authentification', createUser);
    return response.data;
};

export const postLogin = async (login: LoginDto) => {
    const response = await api.post('/authentification/login', login)
    return response.data;
}

export const postRefreshToken = async(refreshToken: String) => {
    const  response = await api.post("/authentification/refreshToken",  { refreshToken });
    return response.data
}

export const postLogout = async(refreshToken: String) => {
    const  response = await api.post("/authentification/logout",  { refreshToken });
    return response.data
}