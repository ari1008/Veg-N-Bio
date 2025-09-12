import api from "../api";
import apiPrivate from "../api.private";
import type {
    DiagnoseRequest,
    DiagnoseResponse,
    ReportErrorRequest,
    VetDisease,
    CreateDiseaseRequest,
    UpdateDiseaseRequest,
    ChatbotSession,
    ChatbotSessionDetail,
    ChatbotReport,
    ResolveReportRequest,
    ChatbotStats,
    SymptomStats,
    RaceStats,
    AccuracyStats,
    PaginatedResponse,
} from "./dto/dto";


export const diagnoseAnimal = async (request: DiagnoseRequest): Promise<DiagnoseResponse> => {
    try {
        const response = await api.post('/notprotected/chatbot/diagnose', request);
        return response.data;
    } catch (err: any) {
        console.error(
            "[diagnoseAnimal] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const reportChatbotError = async (request: ReportErrorRequest): Promise<{ message: string }> => {
    try {
        const response = await api.post('/notprotected/chatbot/report', request);
        return response.data;
    } catch (err: any) {
        console.error(
            "[reportChatbotError] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAvailableRaces = async (): Promise<string[]> => {
    try {
        const response = await api.get('/notprotected/chatbot/races');
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAvailableRaces] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAvailableSymptoms = async (): Promise<string[]> => {
    try {
        const response = await api.get('/notprotected/chatbot/symptoms');
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAvailableSymptoms] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};



export const getAllDiseases = async (page: number = 0, size: number = 10): Promise<PaginatedResponse<VetDisease>> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await apiPrivate.get(`/admin/chatbot/diseases?${params}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllDiseases] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const createDisease = async (request: CreateDiseaseRequest): Promise<VetDisease> => {
    try {
        const response = await apiPrivate.post('/admin/chatbot/diseases', request);
        return response.data;
    } catch (err: any) {
        console.error(
            "[createDisease] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const updateDisease = async (id: string, request: UpdateDiseaseRequest): Promise<VetDisease> => {
    try {
        const response = await apiPrivate.put(`/admin/chatbot/diseases/${id}`, request);
        return response.data;
    } catch (err: any) {
        console.error(
            "[updateDisease] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const deleteDisease = async (id: string): Promise<{ message: string }> => {
    try {
        const response = await apiPrivate.delete(`/admin/chatbot/diseases/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[deleteDisease] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getChatbotStats = async (startDate?: string, endDate?: string): Promise<ChatbotStats> => {
    try {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await apiPrivate.get(`/admin/chatbot/sessions/stats?${params}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getChatbotStats] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAllSessions = async (page: number = 0, size: number = 10): Promise<PaginatedResponse<ChatbotSession>> => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await apiPrivate.get(`/admin/chatbot/sessions?${params}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllSessions] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getSessionDetail = async (id: string): Promise<ChatbotSessionDetail> => {
    try {
        const response = await apiPrivate.get(`/admin/chatbot/sessions/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getSessionDetail] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAllReports = async (resolved: boolean = false, page: number = 0, size: number = 10): Promise<PaginatedResponse<ChatbotReport>> => {
    try {
        const params = new URLSearchParams({
            resolved: resolved.toString(),
            page: page.toString(),
            size: size.toString()
        });
        const response = await apiPrivate.get(`/admin/chatbot/reports?${params}`);
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAllReports] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const resolveReport = async (id: string, request: ResolveReportRequest): Promise<{ message: string }> => {
    try {
        const response = await apiPrivate.put(`/admin/chatbot/reports/${id}/resolve`, request);
        return response.data;
    } catch (err: any) {
        console.error(
            "[resolveReport] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getPopularSymptoms = async (): Promise<SymptomStats[]> => {
    try {
        const response = await apiPrivate.get('/admin/chatbot/analytics/popular-symptoms');
        return response.data;
    } catch (err: any) {
        console.error(
            "[getPopularSymptoms] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getPopularRaces = async (): Promise<RaceStats[]> => {
    try {
        const response = await apiPrivate.get('/admin/chatbot/analytics/popular-races');
        return response.data;
    } catch (err: any) {
        console.error(
            "[getPopularRaces] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};

export const getAccuracyStats = async (): Promise<AccuracyStats> => {
    try {
        const response = await apiPrivate.get('/admin/chatbot/analytics/accuracy');
        return response.data;
    } catch (err: any) {
        console.error(
            "[getAccuracyStats] status =", err?.response?.status,
            "data =", err?.response?.data
        );
        throw err;
    }
};