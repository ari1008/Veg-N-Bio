import api from "../api.ts";
import type {CreateUser} from "./dto/createUserDto.ts";
import type { LoginDto} from "./dto/loginDto.ts";
import apiPrivate from "../api.private.ts";
import type {UserSearchParams, UserSummary} from "./dto/dto.ts";


const  authentification = "/authentification"
const userPath = "/user";
export const postCreateUser = async (createUser: CreateUser) => {
    const response = await api.post(authentification, createUser);
    return response.data;
};

export const postLogin = async (login: LoginDto) => {
    const response = await api.post(`${authentification}/login`, login)
    return response.data;
}

export const postRefreshToken = async(refreshToken: String) => {
    const  response = await api.post(`${authentification}/refreshToken/`,  { refreshToken });
    return response.data
}

export const postLogout = async(refreshToken: String) => {
    const  response = await api.post("/authentification/logout",  { refreshToken });
    return response.data
}

export const getAllCustomers = async (): Promise<UserSummary[]> => {
    try {
        const response = await apiPrivate.get(`${userPath}/customers`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllCustomers] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const searchCustomers = async (params: UserSearchParams = {}): Promise<UserSummary[]> => {
    try {
        const searchParams = new URLSearchParams();

        if (params.name) searchParams.append('name', params.name);
        if (params.email) searchParams.append('email', params.email);
        if (params.limit) searchParams.append('limit', params.limit.toString());

        const response = await apiPrivate.get(`${userPath}/customers/search?${searchParams}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[searchCustomers] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};