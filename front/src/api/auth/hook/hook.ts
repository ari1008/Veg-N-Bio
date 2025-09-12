import type {UseQueryResult} from "@tanstack/react-query";
import type {UserSearchParams, UserSummary} from "../dto/dto.ts";
import {useQuery} from "@tanstack/react-query";
import {getAllCustomers, searchCustomers} from "../auth.ts";
import {useEffect, useState} from "react";


export const useAllUsers = (): UseQueryResult<UserSummary[], Error> =>
    useQuery({
        queryKey: ["users", "all"],
        queryFn: getAllCustomers,
        staleTime: 2 * 60 * 1000, // 2 minutes
        refetchOnWindowFocus: false,
    });

export const useSearchUsers = (params: UserSearchParams = {}) =>
    useQuery({
        queryKey: ["users", "search", params],
        queryFn: () => searchCustomers(params),
        staleTime: 1 * 60 * 1000, // 1 minute
        enabled: !!(params.name || params.email),
        refetchOnWindowFocus: false,
    });

export const useUserSearch = (initialLimit: number = 10) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: searchResults, isLoading: searchLoading } = useSearchUsers({
        name: debouncedSearchTerm || undefined,
        limit: initialLimit,
    });

    const { data: allUsers, isLoading: allUsersLoading } = useAllUsers();

    const users = debouncedSearchTerm ? searchResults : allUsers;
    const isLoading = debouncedSearchTerm ? searchLoading : allUsersLoading;

    return {
        users: users || [],
        isLoading,
        searchTerm,
        setSearchTerm,
        hasSearchTerm: !!debouncedSearchTerm,
    };
};

