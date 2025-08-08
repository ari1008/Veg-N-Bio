import apiPrivate from "../api.private.ts";
import type {Restaurant} from "./dto/restaurant.ts";
import api from "../api.ts";

const notProtected = "/notprotected"
const restaurantPath = "/restaurant"

export const postCreateRestaurant = async (restaurant: Restaurant) => {
    const response = await apiPrivate.post(restaurantPath, restaurant)
    return  response.data
}

export const getAllRestaurant = async () => {
    const response = await api.get(`${notProtected}${restaurantPath}`)
    return response.data
}

export const getOneRestaurant = async (id: String) => {
    const response = await api.get(`${notProtected}${restaurantPath}/${id}`)
    return response.data
}
