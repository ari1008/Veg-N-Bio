export interface DiagnoseRequest {
    race: string;
    symptoms: string[];
}

export interface DiagnoseResponse {
    sessionId: string;
    possibleDiseases: DiseaseResult[];
    shouldConsultVet: boolean;
    generalAdvice: string;
}

export interface DiseaseResult {
    name: string;
    description: string;
    probability: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    advice: string;
}

export interface ReportErrorRequest {
    sessionId: string;
    feedback: string;
    actualDiagnosis?: string;
}

export interface VetDisease {
    id: string;
    name: string;
    description: string;
    symptoms: string[];
    affectedRaces: string[];
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    advice: string;
    prevention?: string;
}

export interface CreateDiseaseRequest {
    name: string;
    description: string;
    symptoms: string[];
    affectedRaces: string[];
    urgency: 'LOW' | 'MEDIUM' | 'HIGH';
    advice: string;
    prevention?: string;
}

export interface UpdateDiseaseRequest {
    name?: string;
    description?: string;
    symptoms?: string[];
    affectedRaces?: string[];
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
    advice?: string;
    prevention?: string;
}

export interface ChatbotSession {
    id: string;
    race: string;
    symptoms: string[];
    createdAt: string;
    hasReports: boolean;
}

export interface ChatbotSessionDetail {
    id: string;
    race: string;
    symptoms: string[];
    diagnosisResult: DiseaseResult[];
    createdAt: string;
    reports: ChatbotReport[];
}

export interface ChatbotReport {
    id: string;
    sessionId: string;
    feedback: string;
    actualDiagnosis?: string;
    resolved: boolean;
    resolution?: string;
    createdAt: string;
}

export interface ResolveReportRequest {
    resolution: string;
    updateDisease?: boolean;
}

export interface ChatbotStats {
    totalSessions: number;
    totalReports: number;
    averageDiagnosisTime: number;
    mostCommonRace: string;
    mostCommonSymptom: string;
    accuracyRate: number;
}

export interface SymptomStats {
    symptom: string;
    count: number;
    percentage: number;
}

export interface RaceStats {
    race: string;
    count: number;
    percentage: number;
}

export interface AccuracyStats {
    totalDiagnoses: number;
    reportedErrors: number;
    accuracyRate: number;
    improvementSuggestions: string[];
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}