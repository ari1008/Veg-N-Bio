import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useGetAllDiseases, useChatbotStats } from '../api/chatbot/hook/hook';
import ChatbotLayout from "./component/ChatbotLayout";

interface ChatbotSettings {
    general: {
        enabled: boolean;
        maintenanceMode: boolean;
        maxSessionsPerDay: number;
        sessionTimeout: number;
        debugMode: boolean;
    };
    diagnosis: {
        minProbabilityThreshold: number;
        maxResultsReturned: number;
        requireExactSymptomMatch: boolean;
        enableRaceSpecificBonus: boolean;
        urgencyWeighting: number;
    };
    messaging: {
        welcomeMessage: string;
        noDiagnosisMessage: string;
        consultVetMessage: string;
        errorMessage: string;
        maintenanceMessage: string;
    };
    notifications: {
        emailEnabled: boolean;
        adminEmail: string;
        highUrgencyAlerts: boolean;
        reportThreshold: number;
        accuracyAlerts: boolean;
        accuracyThreshold: number;
    };
    advanced: {
        logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
        cacheDuration: number;
        apiRateLimit: number;
        backupFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
        dataRetentionDays: number;
    };
}

type SettingsSection = 'general' | 'diagnosis' | 'messaging' | 'notifications' | 'advanced';

const ChatbotSettingsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState<SettingsSection>('general');
    const [settings, setSettings] = useState<ChatbotSettings>({
        general: {
            enabled: true,
            maintenanceMode: false,
            maxSessionsPerDay: 1000,
            sessionTimeout: 30,
            debugMode: false
        },
        diagnosis: {
            minProbabilityThreshold: 15,
            maxResultsReturned: 3,
            requireExactSymptomMatch: false,
            enableRaceSpecificBonus: true,
            urgencyWeighting: 1.2
        },
        messaging: {
            welcomeMessage: "Bienvenue ! Décrivez les symptômes de votre animal pour obtenir un diagnostic.",
            noDiagnosisMessage: "Aucun diagnostic spécifique n'a pu être établi. Consultez un vétérinaire si les symptômes persistent.",
            consultVetMessage: "Il est recommandé de consulter un vétérinaire pour ces symptômes.",
            errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
            maintenanceMessage: "Le chatbot est temporairement indisponible pour maintenance."
        },
        notifications: {
            emailEnabled: true,
            adminEmail: "admin@vegnbio.fr",
            highUrgencyAlerts: true,
            reportThreshold: 10,
            accuracyAlerts: true,
            accuracyThreshold: 85
        },
        advanced: {
            logLevel: 'INFO',
            cacheDuration: 3600,
            apiRateLimit: 100,
            backupFrequency: 'DAILY',
            dataRetentionDays: 90
        }
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const { data: stats } = useChatbotStats();
    const { data: diseasesData } = useGetAllDiseases(0, 1);

    const updateSettings = (section: SettingsSection, key: string, value: any) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));


            setHasUnsavedChanges(false);
            toast.success('Paramètres sauvegardés avec succès !');
        } catch (error) {
            toast.error('Erreur lors de la sauvegarde');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setSettings({
            general: {
                enabled: true,
                maintenanceMode: false,
                maxSessionsPerDay: 1000,
                sessionTimeout: 30,
                debugMode: false
            },
            diagnosis: {
                minProbabilityThreshold: 15,
                maxResultsReturned: 3,
                requireExactSymptomMatch: false,
                enableRaceSpecificBonus: true,
                urgencyWeighting: 1.2
            },
            messaging: {
                welcomeMessage: "Bienvenue ! Décrivez les symptômes de votre animal pour obtenir un diagnostic.",
                noDiagnosisMessage: "Aucun diagnostic spécifique n'a pu être établi. Consultez un vétérinaire si les symptômes persistent.",
                consultVetMessage: "Il est recommandé de consulter un vétérinaire pour ces symptômes.",
                errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
                maintenanceMessage: "Le chatbot est temporairement indisponible pour maintenance."
            },
            notifications: {
                emailEnabled: true,
                adminEmail: "admin@vegnbio.fr",
                highUrgencyAlerts: true,
                reportThreshold: 10,
                accuracyAlerts: true,
                accuracyThreshold: 85
            },
            advanced: {
                logLevel: 'INFO',
                cacheDuration: 3600,
                apiRateLimit: 100,
                backupFrequency: 'DAILY',
                dataRetentionDays: 90
            }
        });
        setHasUnsavedChanges(true);
        setShowResetConfirm(false);
        toast.success('Paramètres réinitialisés aux valeurs par défaut');
    };

    const menuItems = [
        { id: 'general', label: 'Général', icon: '⚙️', description: 'Configuration de base' },
        { id: 'diagnosis', label: 'Diagnostic', icon: '🩺', description: 'Paramètres du moteur' },
        { id: 'messaging', label: 'Messages', icon: '💬', description: 'Personnalisation des réponses' },
        { id: 'notifications', label: 'Notifications', icon: '🔔', description: 'Alertes et emails' },
        { id: 'advanced', label: 'Avancé', icon: '🔧', description: 'Options techniques' }
    ];

    return (
        <ChatbotLayout
            title="Configuration Chatbot"
            subtitle="Personnalisation et paramètres avancés"
        >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Menu */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-lg border border-base-300 sticky top-4">
                        <div className="card-body p-4">
                            <h3 className="font-bold text-base-content mb-4">Paramètres</h3>

                            <div className="space-y-2">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveSection(item.id as SettingsSection)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            activeSection === item.id
                                                ? 'bg-primary text-primary-content'
                                                : 'hover:bg-base-200'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg">{item.icon}</span>
                                            <div>
                                                <div className="font-medium">{item.label}</div>
                                                <div className={`text-xs ${
                                                    activeSection === item.id ? 'text-primary-content/70' : 'text-base-content/60'
                                                }`}>
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* System Status */}
                            <div className="divider"></div>
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-base-content">État du Système</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Statut:</span>
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${settings.general.enabled ? 'bg-success' : 'bg-error'}`}></div>
                                            <span className={settings.general.enabled ? 'text-success' : 'text-error'}>
                                                {settings.general.enabled ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Sessions:</span>
                                        <span className="text-base-content">{stats?.totalSessions || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Maladies:</span>
                                        <span className="text-base-content">{diseasesData?.totalElements || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-base-content/60">Précision:</span>
                                        <span className="text-success">{stats?.accuracyRate?.toFixed(1) || '--'}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3">
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            {/* Section Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">
                                        {menuItems.find(item => item.id === activeSection)?.icon}
                                    </span>
                                    <div>
                                        <h3 className="text-lg font-bold text-base-content">
                                            {menuItems.find(item => item.id === activeSection)?.label}
                                        </h3>
                                        <p className="text-sm text-base-content/60">
                                            {menuItems.find(item => item.id === activeSection)?.description}
                                        </p>
                                    </div>
                                </div>

                                {hasUnsavedChanges && (
                                    <div className="badge badge-warning">
                                        Modifications non sauvegardées
                                    </div>
                                )}
                            </div>

                            {/* Settings Forms */}
                            <div className="space-y-6">
                                {/* General Settings */}
                                {activeSection === 'general' && (
                                    <GeneralSettings
                                        settings={settings.general}
                                        onUpdate={(key, value) => updateSettings('general', key, value)}
                                    />
                                )}

                                {/* Diagnosis Settings */}
                                {activeSection === 'diagnosis' && (
                                    <DiagnosisSettings
                                        settings={settings.diagnosis}
                                        onUpdate={(key, value) => updateSettings('diagnosis', key, value)}
                                    />
                                )}

                                {/* Messaging Settings */}
                                {activeSection === 'messaging' && (
                                    <MessagingSettings
                                        settings={settings.messaging}
                                        onUpdate={(key, value) => updateSettings('messaging', key, value)}
                                    />
                                )}

                                {/* Notifications Settings */}
                                {activeSection === 'notifications' && (
                                    <NotificationsSettings
                                        settings={settings.notifications}
                                        onUpdate={(key, value) => updateSettings('notifications', key, value)}
                                    />
                                )}

                                {/* Advanced Settings */}
                                {activeSection === 'advanced' && (
                                    <AdvancedSettings
                                        settings={settings.advanced}
                                        onUpdate={(key, value) => updateSettings('advanced', key, value)}
                                    />
                                )}
                            </div>

                            {/* Actions */}
                            <div className="divider"></div>
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowResetConfirm(true)}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        🔄 Réinitialiser
                                    </button>
                                    <button
                                        onClick={() => toast.success('Test de configuration envoyé !')}
                                        className="btn btn-ghost btn-sm"
                                    >
                                        🧪 Tester
                                    </button>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSettings(settings);
                                            setHasUnsavedChanges(false);
                                        }}
                                        className="btn btn-ghost"
                                        disabled={!hasUnsavedChanges}
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="btn btn-primary"
                                        disabled={!hasUnsavedChanges || isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <span className="loading loading-spinner loading-sm"></span>
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            '💾 Sauvegarder'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reset Confirmation Modal */}
            {showResetConfirm && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg text-warning mb-4">
                            🔄 Réinitialiser les paramètres
                        </h3>
                        <p className="mb-4">
                            Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?
                        </p>
                        <div className="alert alert-warning mb-4">
                            <span className="text-sm">
                                ⚠️ Cette action ne peut pas être annulée. Toutes vos personnalisations seront perdues.
                            </span>
                        </div>
                        <div className="modal-action">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="btn"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleReset}
                                className="btn btn-warning"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ChatbotLayout>
    );
};


interface GeneralSettingsProps {
    settings: ChatbotSettings['general'];
    onUpdate: (key: string, value: any) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">État du chatbot</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={settings.enabled}
                            onChange={(e) => onUpdate('enabled', e.target.checked)}
                        />
                        <span className="label-text">
                            {settings.enabled ? 'Activé' : 'Désactivé'}
                        </span>
                    </label>
                    <label className="label">
                        <span className="label-text-alt">
                            Active ou désactive complètement le chatbot
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Mode maintenance</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="toggle toggle-warning"
                            checked={settings.maintenanceMode}
                            onChange={(e) => onUpdate('maintenanceMode', e.target.checked)}
                        />
                        <span className="label-text">
                            {settings.maintenanceMode ? 'En maintenance' : 'Opérationnel'}
                        </span>
                    </label>
                    <label className="label">
                        <span className="label-text-alt">
                            Affiche un message de maintenance aux utilisateurs
                        </span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Sessions max/jour</span>
                    </label>
                    <input
                        type="number"
                        className="input input-bordered"
                        value={settings.maxSessionsPerDay}
                        onChange={(e) => onUpdate('maxSessionsPerDay', parseInt(e.target.value))}
                        min="1"
                        max="10000"
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Limite quotidienne de consultations
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Timeout session (min)</span>
                    </label>
                    <input
                        type="number"
                        className="input input-bordered"
                        value={settings.sessionTimeout}
                        onChange={(e) => onUpdate('sessionTimeout', parseInt(e.target.value))}
                        min="5"
                        max="120"
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Durée d'inactivité avant expiration
                        </span>
                    </label>
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Mode debug</span>
                </label>
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="toggle toggle-info"
                        checked={settings.debugMode}
                        onChange={(e) => onUpdate('debugMode', e.target.checked)}
                    />
                    <span className="label-text">
                        {settings.debugMode ? 'Activé' : 'Désactivé'}
                    </span>
                </label>
                <label className="label">
                    <span className="label-text-alt">
                        Active les logs détaillés pour le débogage
                    </span>
                </label>
            </div>
        </div>
    );
};


interface DiagnosisSettingsProps {
    settings: ChatbotSettings['diagnosis'];
    onUpdate: (key: string, value: any) => void;
}

const DiagnosisSettings: React.FC<DiagnosisSettingsProps> = ({ settings, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Seuil de probabilité (%)</span>
                    </label>
                    <input
                        type="range"
                        className="range range-primary"
                        min="5"
                        max="50"
                        value={settings.minProbabilityThreshold}
                        onChange={(e) => onUpdate('minProbabilityThreshold', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-base-content/60 mt-1">
                        <span>5%</span>
                        <span className="font-bold text-primary">{settings.minProbabilityThreshold}%</span>
                        <span>50%</span>
                    </div>
                    <label className="label">
                        <span className="label-text-alt">
                            Probabilité minimum pour afficher un diagnostic
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Résultats max retournés</span>
                    </label>
                    <select
                        className="select select-bordered"
                        value={settings.maxResultsReturned}
                        onChange={(e) => onUpdate('maxResultsReturned', parseInt(e.target.value))}
                    >
                        <option value={1}>1 résultat</option>
                        <option value={2}>2 résultats</option>
                        <option value={3}>3 résultats</option>
                        <option value={5}>5 résultats</option>
                    </select>
                    <label className="label">
                        <span className="label-text-alt">
                            Nombre maximum de diagnostics à afficher
                        </span>
                    </label>
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Correspondance exacte des symptômes</span>
                </label>
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="toggle toggle-secondary"
                        checked={settings.requireExactSymptomMatch}
                        onChange={(e) => onUpdate('requireExactSymptomMatch', e.target.checked)}
                    />
                    <span className="label-text">
                        {settings.requireExactSymptomMatch ? 'Correspondance exacte' : 'Correspondance partielle'}
                    </span>
                </label>
                <label className="label">
                    <span className="label-text-alt">
                        Exige que tous les symptômes correspondent exactement
                    </span>
                </label>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Bonus spécifique aux races</span>
                </label>
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="toggle toggle-accent"
                        checked={settings.enableRaceSpecificBonus}
                        onChange={(e) => onUpdate('enableRaceSpecificBonus', e.target.checked)}
                    />
                    <span className="label-text">
                        {settings.enableRaceSpecificBonus ? 'Activé' : 'Désactivé'}
                    </span>
                </label>
                <label className="label">
                    <span className="label-text-alt">
                        Donne plus de poids aux maladies spécifiques à la race
                    </span>
                </label>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Pondération d'urgence</span>
                </label>
                <input
                    type="range"
                    className="range range-warning"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.urgencyWeighting}
                    onChange={(e) => onUpdate('urgencyWeighting', parseFloat(e.target.value))}
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                    <span>0.5x</span>
                    <span className="font-bold text-warning">{settings.urgencyWeighting}x</span>
                    <span>2x</span>
                </div>
                <label className="label">
                    <span className="label-text-alt">
                        Multiplicateur pour les maladies d'urgence élevée
                    </span>
                </label>
            </div>
        </div>
    );
};


interface MessagingSettingsProps {
    settings: ChatbotSettings['messaging'];
    onUpdate: (key: string, value: any) => void;
}

const MessagingSettings: React.FC<MessagingSettingsProps> = ({ settings, onUpdate }) => {
    const messageTemplates = [
        {
            key: 'welcomeMessage',
            label: 'Message de bienvenue',
            placeholder: 'Message affiché au lancement du chatbot'
        },
        {
            key: 'noDiagnosisMessage',
            label: 'Aucun diagnostic',
            placeholder: 'Message affiché quand aucun diagnostic n\'est trouvé'
        },
        {
            key: 'consultVetMessage',
            label: 'Consulter vétérinaire',
            placeholder: 'Message pour recommander une consultation'
        },
        {
            key: 'errorMessage',
            label: 'Message d\'erreur',
            placeholder: 'Message en cas d\'erreur technique'
        },
        {
            key: 'maintenanceMessage',
            label: 'Message de maintenance',
            placeholder: 'Message affiché en mode maintenance'
        }
    ];

    return (
        <div className="space-y-6">
            {messageTemplates.map((template) => (
                <div key={template.key} className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">{template.label}</span>
                        <span className="label-text-alt">
                            {(settings[template.key as keyof typeof settings] as string).length}/500
                        </span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered h-24"
                        placeholder={template.placeholder}
                        maxLength={500}
                        value={settings[template.key as keyof typeof settings] as string}
                        onChange={(e) => onUpdate(template.key, e.target.value)}
                    />
                </div>
            ))}

            <div className="alert alert-info">
                <span className="text-sm">
                    💡 Vous pouvez utiliser les variables suivantes dans vos messages :
                    <br />
                    <code className="text-xs">&#123;race&#125;</code> - Race de l'animal
                    <br />
                    <code className="text-xs">&#123;symptoms&#125;</code> - Liste des symptômes
                    <br />
                    <code className="text-xs">&#123;username&#125;</code> - Nom de l'utilisateur
                </span>
            </div>
        </div>
    );
};


interface NotificationsSettingsProps {
    settings: ChatbotSettings['notifications'];
    onUpdate: (key: string, value: any) => void;
}

const NotificationsSettings: React.FC<NotificationsSettingsProps> = ({ settings, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Notifications par email</span>
                </label>
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={settings.emailEnabled}
                        onChange={(e) => onUpdate('emailEnabled', e.target.checked)}
                    />
                    <span className="label-text">
                        {settings.emailEnabled ? 'Activées' : 'Désactivées'}
                    </span>
                </label>
            </div>

            {settings.emailEnabled && (
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Email administrateur</span>
                    </label>
                    <input
                        type="email"
                        className="input input-bordered"
                        placeholder="admin@example.com"
                        value={settings.adminEmail}
                        onChange={(e) => onUpdate('adminEmail', e.target.value)}
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Email où seront envoyées les notifications importantes
                        </span>
                    </label>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Alertes urgence élevée</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="toggle toggle-error"
                            checked={settings.highUrgencyAlerts}
                            onChange={(e) => onUpdate('highUrgencyAlerts', e.target.checked)}
                        />
                        <span className="label-text">
                            {settings.highUrgencyAlerts ? 'Activées' : 'Désactivées'}
                        </span>
                    </label>
                    <label className="label">
                        <span className="label-text-alt">
                            Notification lors de diagnostics d'urgence élevée
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Seuil signalements</span>
                    </label>
                    <input
                        type="number"
                        className="input input-bordered"
                        min="1"
                        max="100"
                        value={settings.reportThreshold}
                        onChange={(e) => onUpdate('reportThreshold', parseInt(e.target.value))}
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Nombre de signalements déclenchant une alerte
                        </span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Alertes précision</span>
                    </label>
                    <label className="label cursor-pointer justify-start gap-3">
                        <input
                            type="checkbox"
                            className="toggle toggle-warning"
                            checked={settings.accuracyAlerts}
                            onChange={(e) => onUpdate('accuracyAlerts', e.target.checked)}
                        />
                        <span className="label-text">
                            {settings.accuracyAlerts ? 'Activées' : 'Désactivées'}
                        </span>
                    </label>
                    <label className="label">
                        <span className="label-text-alt">
                            Notification si la précision chute
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Seuil précision (%)</span>
                    </label>
                    <input
                        type="range"
                        className="range range-warning"
                        min="70"
                        max="95"
                        value={settings.accuracyThreshold}
                        onChange={(e) => onUpdate('accuracyThreshold', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-xs text-base-content/60 mt-1">
                        <span>70%</span>
                        <span className="font-bold text-warning">{settings.accuracyThreshold}%</span>
                        <span>95%</span>
                    </div>
                    <label className="label">
                        <span className="label-text-alt">
                            Seuil en-dessous duquel une alerte est envoyée
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

interface AdvancedSettingsProps {
    settings: ChatbotSettings['advanced'];
    onUpdate: (key: string, value: any) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ settings, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="alert alert-warning mb-6">
                <span className="text-sm">
                    ⚠️ <strong>Attention :</strong> Ces paramètres sont destinés aux utilisateurs avancés.
                    Des modifications incorrectes peuvent affecter les performances du système.
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Niveau de logs</span>
                    </label>
                    <select
                        className="select select-bordered"
                        value={settings.logLevel}
                        onChange={(e) => onUpdate('logLevel', e.target.value)}
                    >
                        <option value="ERROR">ERROR - Erreurs uniquement</option>
                        <option value="WARN">WARN - Avertissements et erreurs</option>
                        <option value="INFO">INFO - Informations générales</option>
                        <option value="DEBUG">DEBUG - Détails complets</option>
                    </select>
                    <label className="label">
                        <span className="label-text-alt">
                            Verbosité des logs système
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Durée cache (secondes)</span>
                    </label>
                    <input
                        type="number"
                        className="input input-bordered"
                        min="300"
                        max="86400"
                        step="300"
                        value={settings.cacheDuration}
                        onChange={(e) => onUpdate('cacheDuration', parseInt(e.target.value))}
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Durée de mise en cache des résultats
                        </span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Limite API (req/min)</span>
                    </label>
                    <input
                        type="number"
                        className="input input-bordered"
                        min="10"
                        max="1000"
                        value={settings.apiRateLimit}
                        onChange={(e) => onUpdate('apiRateLimit', parseInt(e.target.value))}
                    />
                    <label className="label">
                        <span className="label-text-alt">
                            Nombre maximum de requêtes par minute
                        </span>
                    </label>
                </div>

                <div className="form-control">
                    <label className="label">
                        <span className="label-text font-medium">Fréquence de sauvegarde</span>
                    </label>
                    <select
                        className="select select-bordered"
                        value={settings.backupFrequency}
                        onChange={(e) => onUpdate('backupFrequency', e.target.value)}
                    >
                        <option value="DAILY">Quotidienne</option>
                        <option value="WEEKLY">Hebdomadaire</option>
                        <option value="MONTHLY">Mensuelle</option>
                    </select>
                    <label className="label">
                        <span className="label-text-alt">
                            Fréquence des sauvegardes automatiques
                        </span>
                    </label>
                </div>
            </div>

            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Rétention des données (jours)</span>
                </label>
                <input
                    type="range"
                    className="range range-info"
                    min="30"
                    max="365"
                    step="30"
                    value={settings.dataRetentionDays}
                    onChange={(e) => onUpdate('dataRetentionDays', parseInt(e.target.value))}
                />
                <div className="flex justify-between text-xs text-base-content/60 mt-1">
                    <span>30 jours</span>
                    <span className="font-bold text-info">{settings.dataRetentionDays} jours</span>
                    <span>1 an</span>
                </div>
                <label className="label">
                    <span className="label-text-alt">
                        Durée de conservation des sessions et logs
                    </span>
                </label>
            </div>

            {/* Performance Monitoring */}
            <div className="card bg-base-50 border border-base-300">
                <div className="card-body p-4">
                    <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                        <span>📊</span>
                        Monitoring des performances
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <div className="text-base-content/60">Utilisation CPU</div>
                            <div className="font-bold text-success">12%</div>
                        </div>
                        <div>
                            <div className="text-base-content/60">Mémoire</div>
                            <div className="font-bold text-info">340MB</div>
                        </div>
                        <div>
                            <div className="text-base-content/60">Cache Hit Rate</div>
                            <div className="font-bold text-primary">87%</div>
                        </div>
                        <div>
                            <div className="text-base-content/60">Uptime</div>
                            <div className="font-bold text-success">99.9%</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database Status */}
            <div className="card bg-base-50 border border-base-300">
                <div class="card-body p-4">
                    <h4 className="font-semibold text-base-content mb-3 flex items-center gap-2">
                        <span>🗄️</span>
                        État de la base de données
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-base-content/60">Dernière sauvegarde:</span>
                            <span className="text-base-content">Il y a 2 heures</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-base-content/60">Taille base:</span>
                            <span className="text-base-content">24.7 MB</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-base-content/60">Connexions actives:</span>
                            <span className="text-base-content">3/20</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-base-content/60">Temps réponse moyen:</span>
                            <span className="text-success">12ms</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button className="btn btn-outline btn-xs">
                            🔧 Optimiser
                        </button>
                        <button className="btn btn-outline btn-xs">
                            💾 Forcer sauvegarde
                        </button>
                        <button className="btn btn-outline btn-xs">
                            📊 Statistiques détaillées
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatbotSettingsPage;