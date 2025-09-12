import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import type {
    DiagnoseRequest,
    DiagnoseResponse,
    ReportErrorRequest,
} from "../dto/dto";
import {
    diagnoseAnimal,
    reportChatbotError,
    getAvailableRaces,
    getAvailableSymptoms,
} from "../chatbot";

export const useDiagnoseAnimal = (): UseMutationResult<DiagnoseResponse, unknown, DiagnoseRequest> =>
    useMutation({
        mutationFn: (data: DiagnoseRequest) => diagnoseAnimal(data),
    });

export const useReportChatbotError = (): UseMutationResult<{ message: string }, unknown, ReportErrorRequest> =>
    useMutation({
        mutationFn: (data: ReportErrorRequest) => reportChatbotError(data),
    });

export const useAvailableRaces = (): UseQueryResult<string[], unknown> =>
    useQuery({
        queryKey: ['chatbot', 'races'],
        queryFn: () => getAvailableRaces(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

export const useAvailableSymptoms = (): UseQueryResult<string[], unknown> =>
    useQuery({
        queryKey: ['chatbot', 'symptoms'],
        queryFn: () => getAvailableSymptoms(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });