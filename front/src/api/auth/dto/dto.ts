export interface UserSummary {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    fullName: string;
}

export interface UserSearchParams {
    name?: string;
    email?: string;
    limit?: number;
}