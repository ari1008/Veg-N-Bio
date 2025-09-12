import { useMutation, useQuery, useQueryClient, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import type {
    VetDisease,
    CreateDiseaseRequest,
    UpdateDiseaseRequest,
    ChatbotStats,
    ChatbotSession,
    ChatbotSessionDetail,
    ChatbotReport,
    ResolveReportRequest,
    SymptomStats,
    RaceStats,
    AccuracyStats,
    PaginatedResponse,
} from "../dto/dto";
import {
    getAllDiseases,
    createDisease,
    updateDisease,
    deleteDisease,
    getChatbotStats,
    getAllSessions,
    getSessionDetail,
    getAllReports,
    resolveReport,
    getPopularSymptoms,
    getPopularRaces,
    getAccuracyStats,
} from "../chatbot";

export const useGetAllDiseases = (page: number = 0, size: number = 10): UseQueryResult<PaginatedResponse<VetDisease>, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'diseases', page, size],
        queryFn: () => getAllDiseases(page, size),
    });

export const useCreateDisease = (): UseMutationResult<VetDisease, unknown, CreateDiseaseRequest> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateDiseaseRequest) => createDisease(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'diseases'] });
        },
    });
};

export const useUpdateDisease = (): UseMutationResult<VetDisease, unknown, { id: string; data: UpdateDiseaseRequest }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateDiseaseRequest }) => updateDisease(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'diseases'] });
        },
    });
};

export const useDeleteDisease = (): UseMutationResult<{ message: string }, unknown, string> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteDisease(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'diseases'] });
        },
    });
};

export const useChatbotStats = (startDate?: string, endDate?: string): UseQueryResult<ChatbotStats, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'stats', startDate, endDate],
        queryFn: () => getChatbotStats(startDate, endDate),
        refetchInterval: 30000,
    });

export const useGetAllSessions = (page: number = 0, size: number = 10): UseQueryResult<PaginatedResponse<ChatbotSession>, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'sessions', page, size],
        queryFn: () => getAllSessions(page, size),
    });

export const useGetSessionDetail = (id: string): UseQueryResult<ChatbotSessionDetail, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'session', id],
        queryFn: () => getSessionDetail(id),
        enabled: !!id,
    });

export const useGetAllReports = (resolved: boolean = false, page: number = 0, size: number = 10): UseQueryResult<PaginatedResponse<ChatbotReport>, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'reports', resolved, page, size],
        queryFn: () => getAllReports(resolved, page, size),
    });

export const useResolveReport = (): UseMutationResult<{ message: string }, unknown, { id: string; data: ResolveReportRequest }> => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ResolveReportRequest }) => resolveReport(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'reports'] });
            queryClient.invalidateQueries({ queryKey: ['chatbot', 'stats'] });
        },
    });
};

export const usePopularSymptoms = (): UseQueryResult<SymptomStats[], unknown> =>
    useQuery({
        queryKey: ['chatbot', 'analytics', 'symptoms'],
        queryFn: () => getPopularSymptoms(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

export const usePopularRaces = (): UseQueryResult<RaceStats[], unknown> =>
    useQuery({
        queryKey: ['chatbot', 'analytics', 'races'],
        queryFn: () => getPopularRaces(),
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

export const useAccuracyStats = (): UseQueryResult<AccuracyStats, unknown> =>
    useQuery({
        queryKey: ['chatbot', 'analytics', 'accuracy'],
        queryFn: () => getAccuracyStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
