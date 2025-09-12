import React, { useState, useMemo } from 'react';
import {
    useChatbotStats,
    usePopularSymptoms,
    usePopularRaces,
    useAccuracyStats,
    useGetAllSessions
} from '../api/chatbot/hook/hook';
import ChatbotLayout from "./component/ChatbotLayout.tsx";
import MetricCard from "./component/MetricCard.tsx";

type TimeRange = '7d' | '30d' | '90d' | '1y';
type ChartType = 'line' | 'bar' | 'pie';

const ChatbotAnalyticsPage: React.FC = () => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [activeChart, setActiveChart] = useState<'sessions' | 'symptoms' | 'races' | 'accuracy'>('sessions');

    const { data: stats, isLoading: statsLoading } = useChatbotStats();
    const { data: symptoms, isLoading: symptomsLoading } = usePopularSymptoms();
    const { data: races, isLoading: racesLoading } = usePopularRaces();
    const { data: accuracyStats, isLoading: accuracyLoading } = useAccuracyStats();
    const { data: sessionsData } = useGetAllSessions(0, 100);

    const timeSeriesData = useMemo(() => {
        const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
        const data = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            const baseValue = 15 + Math.sin(i / 7) * 5;
            const randomVariation = (Math.random() - 0.5) * 6;

            data.push({
                date: date.toISOString().split('T')[0],
                sessions: Math.max(0, Math.round(baseValue + randomVariation)),
                accuracy: Math.min(100, Math.max(80, 92 + (Math.random() - 0.5) * 8)),
                reports: Math.max(0, Math.round((25 - baseValue) / 5 + Math.random() * 2))
            });
        }

        return data;
    }, [timeRange]);

    const getTimeRangeLabel = (range: TimeRange) => {
        const labels = {
            '7d': '7 derniers jours',
            '30d': '30 derniers jours',
            '90d': '3 derniers mois',
            '1y': 'Dernière année'
        };
        return labels[range];
    };


    const calculateTrend = (data: number[]) => {
        if (data.length < 2) return { value: 0, isPositive: true };
        const recent = data.slice(-7).reduce((a, b) => a + b, 0) / 7;
        const previous = data.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
        const change = ((recent - previous) / previous) * 100;
        return {
            value: Math.abs(Math.round(change)),
            isPositive: change >= 0
        };
    };

    const sessionsTrend = calculateTrend(timeSeriesData.map(d => d.sessions));
    const accuracyTrend = calculateTrend(timeSeriesData.map(d => d.accuracy));
    const reportsTrend = calculateTrend(timeSeriesData.map(d => d.reports));

    const totalSessions = timeSeriesData.reduce((sum, d) => sum + d.sessions, 0);
    const avgAccuracy = timeSeriesData.reduce((sum, d) => sum + d.accuracy, 0) / timeSeriesData.length;
    const totalReports = timeSeriesData.reduce((sum, d) => sum + d.reports, 0);

    return (
        <ChatbotLayout
            title="Analytics Avancés"
            subtitle="Analyse détaillée des performances du chatbot"
        >
            <div className="space-y-8">
                {/* Time Range Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-base-content mb-2">
                            Tableau de bord analytique
                        </h2>
                        <p className="text-base-content/60">
                            Analyse des performances sur {getTimeRangeLabel(timeRange).toLowerCase()}
                        </p>
                    </div>

                    <div className="tabs tabs-boxed">
                        {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                className={`tab ${timeRange === range ? 'tab-active' : ''}`}
                                onClick={() => setTimeRange(range)}
                            >
                                {getTimeRangeLabel(range)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Sessions Totales"
                        value={totalSessions}
                        icon="📊"
                        trend={sessionsTrend}
                        subtitle={getTimeRangeLabel(timeRange)}
                        color="primary"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Précision Moyenne"
                        value={`${avgAccuracy.toFixed(1)}%`}
                        icon="🎯"
                        trend={accuracyTrend}
                        subtitle="Diagnostics corrects"
                        color="success"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Signalements"
                        value={totalReports}
                        icon="⚠️"
                        trend={reportsTrend}
                        subtitle="Erreurs remontées"
                        color="warning"
                        isLoading={statsLoading}
                    />

                    <MetricCard
                        title="Taux d'Amélioration"
                        value={`${Math.max(0, 100 - (totalReports / totalSessions * 100)).toFixed(1)}%`}
                        icon="📈"
                        trend={{ value: Math.round(avgAccuracy - 85), isPositive: avgAccuracy > 85 }}
                        subtitle="Performance globale"
                        color="info"
                        isLoading={statsLoading}
                    />
                </div>

                {/* Chart Selection */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                            <h3 className="text-lg font-bold text-base-content">
                                Évolution Temporelle
                            </h3>
                            <div className="tabs tabs-boxed tabs-sm">
                                <button
                                    className={`tab ${activeChart === 'sessions' ? 'tab-active' : ''}`}
                                    onClick={() => setActiveChart('sessions')}
                                >
                                    📊 Sessions
                                </button>
                                <button
                                    className={`tab ${activeChart === 'accuracy' ? 'tab-active' : ''}`}
                                    onClick={() => setActiveChart('accuracy')}
                                >
                                    🎯 Précision
                                </button>
                                <button
                                    className={`tab ${activeChart === 'symptoms' ? 'tab-active' : ''}`}
                                    onClick={() => setActiveChart('symptoms')}
                                >
                                    🔍 Symptômes
                                </button>
                                <button
                                    className={`tab ${activeChart === 'races' ? 'tab-active' : ''}`}
                                    onClick={() => setActiveChart('races')}
                                >
                                    🐕 Races
                                </button>
                            </div>
                        </div>

                        {/* Chart Content */}
                        {activeChart === 'sessions' && (
                            <TimeSeriesChart
                                data={timeSeriesData}
                                dataKey="sessions"
                                title="Nombre de sessions par jour"
                                color="#3b82f6"
                                yAxisLabel="Sessions"
                            />
                        )}

                        {activeChart === 'accuracy' && (
                            <TimeSeriesChart
                                data={timeSeriesData}
                                dataKey="accuracy"
                                title="Évolution de la précision (%)"
                                color="#10b981"
                                yAxisLabel="Précision (%)"
                                isPercentage
                            />
                        )}

                        {activeChart === 'symptoms' && (
                            <BarChart
                                data={symptoms || []}
                                title="Symptômes les plus fréquents"
                                isLoading={symptomsLoading}
                            />
                        )}

                        {activeChart === 'races' && (
                            <PieChart
                                data={races || []}
                                title="Répartition des races consultées"
                                isLoading={racesLoading}
                            />
                        )}
                    </div>
                </div>

                {/* Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Analysis */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h3 className="text-lg font-bold text-base-content mb-4">
                                📈 Analyse des Performances
                            </h3>

                            {accuracyLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="animate-pulse flex justify-between">
                                            <div className="h-4 bg-base-300 rounded w-1/2"></div>
                                            <div className="h-4 bg-base-300 rounded w-1/4"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-base-content/70">Diagnostics totaux:</span>
                                        <span className="font-bold text-primary">
                                            {accuracyStats?.totalDiagnoses || stats?.totalSessions || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-base-content/70">Erreurs signalées:</span>
                                        <span className="font-bold text-warning">
                                            {accuracyStats?.reportedErrors || stats?.totalReports || 0}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-base-content/70">Taux de réussite:</span>
                                        <span className="font-bold text-success">
                                            {accuracyStats?.accuracyRate?.toFixed(1) || stats?.accuracyRate?.toFixed(1) || '0.0'}%
                                        </span>
                                    </div>

                                    <div className="divider"></div>

                                    <div>
                                        <h4 className="font-semibold text-base-content mb-2">
                                            💡 Suggestions d'amélioration
                                        </h4>
                                        <ul className="space-y-2">
                                            {(accuracyStats?.improvementSuggestions || [
                                                "Enrichir la base de symptômes spécifiques",
                                                "Améliorer la correspondance race-maladie",
                                                "Ajouter plus de maladies communes"
                                            ]).map((suggestion, idx) => (
                                                <li key={idx} className="text-sm text-base-content/80 flex items-start gap-2">
                                                    <span className="text-primary">•</span>
                                                    {suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Usage Patterns */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h3 className="text-lg font-bold text-base-content mb-4">
                                🔍 Patterns d'Utilisation
                            </h3>

                            <div className="space-y-6">
                                {/* Peak Hours */}
                                <div>
                                    <h4 className="font-semibold text-base-content mb-3">
                                        ⏰ Heures de pointe
                                    </h4>
                                    <div className="space-y-2">
                                        {[
                                            { hour: '14h - 16h', percentage: 32, label: 'Après-midi' },
                                            { hour: '18h - 20h', percentage: 28, label: 'Soirée' },
                                            { hour: '10h - 12h', percentage: 24, label: 'Matin' },
                                            { hour: '20h - 22h', percentage: 16, label: 'Nuit' }
                                        ].map((slot) => (
                                            <div key={slot.hour} className="flex items-center gap-3">
                                                <span className="text-xs font-medium text-base-content w-20">
                                                    {slot.hour}
                                                </span>
                                                <div className="flex-1 bg-base-200 rounded-full h-2">
                                                    <div
                                                        className="bg-primary h-2 rounded-full transition-all duration-500"
                                                        style={{ width: `${slot.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs text-base-content/60 w-8">
                                                    {slot.percentage}%
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekly Pattern */}
                                <div>
                                    <h4 className="font-semibold text-base-content mb-3">
                                        📅 Répartition hebdomadaire
                                    </h4>
                                    <div className="grid grid-cols-7 gap-1">
                                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => {
                                            const activity = [20, 25, 22, 26, 18, 12, 8][idx];
                                            return (
                                                <div key={day} className="text-center">
                                                    <div className="text-xs text-base-content/60 mb-1">{day}</div>
                                                    <div className="bg-base-200 rounded h-12 flex items-end">
                                                        <div
                                                            className="bg-secondary w-full rounded transition-all duration-500"
                                                            style={{ height: `${activity * 2}%` }}
                                                            title={`${activity}% d'activité`}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-base-content/40 mt-1">
                                                        {activity}%
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights and Recommendations */}
                <div className="card bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
                    <div className="card-body">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🧠</div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-base-content mb-4">
                                    Insights Intelligents
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">📊</span>
                                            <h4 className="font-semibold text-base-content">Tendance</h4>
                                        </div>
                                        <p className="text-sm text-base-content/80">
                                            {sessionsTrend.isPositive ?
                                                `Les consultations augmentent de ${sessionsTrend.value}% cette semaine` :
                                                `Les consultations baissent de ${sessionsTrend.value}% cette semaine`
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">🎯</span>
                                            <h4 className="font-semibold text-base-content">Qualité</h4>
                                        </div>
                                        <p className="text-sm text-base-content/80">
                                            {avgAccuracy > 90 ?
                                                "Excellente précision maintenue" :
                                                "Marge d'amélioration sur la précision"
                                            }
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">💡</span>
                                            <h4 className="font-semibold text-base-content">Recommandation</h4>
                                        </div>
                                        <p className="text-sm text-base-content/80">
                                            {totalReports > totalSessions * 0.1 ?
                                                "Prioriser la résolution des signalements" :
                                                "Continuer l'enrichissement de la base"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Export and Actions */}
                <div className="flex justify-center">
                    <div className="join">
                        <button className="btn btn-outline join-item">
                            📥 Exporter Rapport
                        </button>
                        <button className="btn btn-outline join-item">
                            📊 Rapport Mensuel
                        </button>
                        <button className="btn btn-outline join-item">
                            🔄 Actualiser Données
                        </button>
                    </div>
                </div>
            </div>
        </ChatbotLayout>
    );
};


interface TimeSeriesChartProps {
    data: Array<{date: string; [key: string]: any}>;
    dataKey: string;
    title: string;
    color: string;
    yAxisLabel: string;
    isPercentage?: boolean;
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
                                                             data,
                                                             dataKey,
                                                             title,
                                                             color,
                                                             yAxisLabel,
                                                             isPercentage = false
                                                         }) => {
    const maxValue = Math.max(...data.map(d => d[dataKey]));
    const minValue = Math.min(...data.map(d => d[dataKey]));
    const range = maxValue - minValue;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-base-content text-center">{title}</h4>

            <div className="relative h-64 bg-base-50 rounded-lg p-4">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-base-content/60">
                    <span>{isPercentage ? `${maxValue.toFixed(0)}%` : maxValue.toFixed(0)}</span>
                    <span>{isPercentage ? `${((maxValue + minValue) / 2).toFixed(0)}%` : ((maxValue + minValue) / 2).toFixed(0)}</span>
                    <span>{isPercentage ? `${minValue.toFixed(0)}%` : minValue.toFixed(0)}</span>
                </div>

                {/* Chart area */}
                <div className="ml-14 mr-4 h-full relative">
                    <svg className="w-full h-full">
                        {/* Grid lines */}
                        {[0, 25, 50, 75, 100].map(percent => (
                            <line
                                key={percent}
                                x1="0"
                                y1={`${percent}%`}
                                x2="100%"
                                y2={`${percent}%`}
                                stroke="#e5e7eb"
                                strokeWidth="1"
                                strokeDasharray="2,2"
                            />
                        ))}

                        {/* Data line */}
                        <polyline
                            fill="none"
                            stroke={color}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={data.map((d, i) => {
                                const x = (i / (data.length - 1)) * 100;
                                const y = ((maxValue - d[dataKey]) / range) * 100;
                                return `${x},${y}`;
                            }).join(' ')}
                        />

                        {/* Data points */}
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 100;
                            const y = ((maxValue - d[dataKey]) / range) * 100;
                            return (
                                <circle
                                    key={i}
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r="4"
                                    fill={color}
                                    className="hover:r-6 transition-all cursor-pointer"
                                >
                                    <title>{`${d.date}: ${d[dataKey]}${isPercentage ? '%' : ''}`}</title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>

                {/* X-axis labels */}
                <div className="ml-14 mr-4 flex justify-between mt-2 text-xs text-base-content/60">
                    <span>{data[0]?.date}</span>
                    <span>{data[Math.floor(data.length / 2)]?.date}</span>
                    <span>{data[data.length - 1]?.date}</span>
                </div>
            </div>
        </div>
    );
};


interface BarChartProps {
    data: Array<{symptom: string; count: number; percentage: number}>;
    title: string;
    isLoading: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold text-base-content text-center">{title}</h4>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="animate-pulse flex items-center gap-4">
                            <div className="h-4 bg-base-300 rounded w-24"></div>
                            <div className="h-4 bg-base-300 rounded flex-1"></div>
                            <div className="h-4 bg-base-300 rounded w-12"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-base-content text-center">{title}</h4>

            <div className="space-y-3">
                {data.slice(0, 8).map((item, idx) => (
                    <div key={item.symptom} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium text-base-content/70 capitalize">
                            {item.symptom}
                        </div>
                        <div className="flex-1 bg-base-200 rounded-full h-6 relative">
                            <div
                                className="bg-gradient-to-r from-primary to-secondary h-6 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                                style={{ width: `${(item.count / maxCount) * 100}%` }}
                            >
                                <span className="text-xs font-bold text-white">
                                    {item.count}
                                </span>
                            </div>
                        </div>
                        <div className="w-12 text-sm text-base-content/60 text-right">
                            {item.percentage.toFixed(1)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


interface PieChartProps {
    data: Array<{race: string; count: number; percentage: number}>;
    title: string;
    isLoading: boolean;
}

const PieChart: React.FC<PieChartProps> = ({ data, title, isLoading }) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <h4 className="font-semibold text-base-content text-center">{title}</h4>
                <div className="flex justify-center">
                    <div className="w-48 h-48 bg-base-300 rounded-full animate-pulse"></div>
                </div>
            </div>
        );
    }

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];
    let currentAngle = 0;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-base-content text-center">{title}</h4>

            <div className="flex flex-col lg:flex-row items-center gap-6">
                {/* Pie Chart */}
                <div className="relative">
                    <svg width="200" height="200" className="transform -rotate-90">
                        {data.slice(0, 6).map((item, idx) => {
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + (item.percentage / 100) * 360;
                            currentAngle = endAngle;

                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

                            const x1 = 100 + 80 * Math.cos(startAngleRad);
                            const y1 = 100 + 80 * Math.sin(startAngleRad);
                            const x2 = 100 + 80 * Math.cos(endAngleRad);
                            const y2 = 100 + 80 * Math.sin(endAngleRad);

                            const pathData = [
                                `M 100 100`,
                                `L ${x1} ${y1}`,
                                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                "z"
                            ].join(" ");

                            return (
                                <path
                                    key={idx}
                                    d={pathData}
                                    fill={colors[idx]}
                                    className="hover:opacity-80 transition-opacity cursor-pointer"
                                >
                                    <title>{`${item.race}: ${item.count} (${item.percentage.toFixed(1)}%)`}</title>
                                </path>
                            );
                        })}
                    </svg>
                </div>

                {/* Legend */}
                <div className="space-y-2">
                    {data.slice(0, 6).map((item, idx) => (
                        <div key={item.race} className="flex items-center gap-3">
                            <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: colors[idx] }}
                            ></div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-base-content capitalize">
                                    {item.race}
                                </div>
                                <div className="text-xs text-base-content/60">
                                    {item.count} consultations ({item.percentage.toFixed(1)}%)
                                </div>
                            </div>
                        </div>
                    ))}

                    {data.length > 6 && (
                        <div className="flex items-center gap-3 pt-2 border-t border-base-300">
                            <div className="w-4 h-4 rounded bg-base-300"></div>
                            <div className="text-sm text-base-content/60">
                                +{data.length - 6} autres races
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatbotAnalyticsPage;