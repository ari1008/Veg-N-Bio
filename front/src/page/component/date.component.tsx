import React, { useState, useEffect } from 'react';

export const DateTimeInput = ({ label, error, value, onChange, min, placeholder }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    // Extraire date et heure du datetime-local
    useEffect(() => {
        if (value) {
            const dateObj = new Date(value);
            if (!isNaN(dateObj.getTime())) {
                setDate(dateObj.toISOString().split('T')[0]);
                setTime(dateObj.toTimeString().slice(0, 5));
            }
        }
    }, [value]);

    // Mettre à jour la valeur combinée
    const updateDateTime = (newDate, newTime) => {
        if (newDate && newTime) {
            const combined = `${newDate}T${newTime}`;
            onChange(combined);
        } else {
            onChange('');
        }
    };

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        updateDateTime(newDate, time);
    };

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        updateDateTime(date, newTime);
    };

    // Raccourcis pour les dates courantes
    const setToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
        updateDateTime(today, time || '09:00');
    };

    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setDate(tomorrowStr);
        updateDateTime(tomorrowStr, time || '09:00');
    };

    const setNextWeek = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        setDate(nextWeekStr);
        updateDateTime(nextWeekStr, time || '09:00');
    };

    // Raccourcis pour les heures courantes
    const timePresets = [
        { label: '9h00', value: '09:00' },
        { label: '12h00', value: '12:00' },
        { label: '14h00', value: '14:00' },
        { label: '17h00', value: '17:00' },
        { label: '19h00', value: '19:00' },
    ];

    const minDate = min ? new Date(min).toISOString().split('T')[0] :
        new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-3">
            <label className="label">
                <span className="label-text font-medium">{label}</span>
            </label>

            {/* Raccourcis de dates */}
            <div className="flex flex-wrap gap-2 mb-3">
                <button
                    type="button"
                    onClick={setToday}
                    className="btn btn-outline btn-xs"
                >
                    Aujourd'hui
                </button>
                <button
                    type="button"
                    onClick={setTomorrow}
                    className="btn btn-outline btn-xs"
                >
                    Demain
                </button>
                <button
                    type="button"
                    onClick={setNextWeek}
                    className="btn btn-outline btn-xs"
                >
                    Semaine prochaine
                </button>
            </div>

            {/* Saisie de date et heure séparées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <label className="label">
                        <span className="label-text text-sm">Date</span>
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        min={minDate}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label className="label">
                        <span className="label-text text-sm">Heure</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className="input input-bordered w-full"
                    />
                </div>
            </div>

            {/* Raccourcis d'heures */}
            {date && (
                <div className="flex flex-wrap gap-2">
                    {timePresets.map((preset) => (
                        <button
                            key={preset.value}
                            type="button"
                            onClick={() => {
                                setTime(preset.value);
                                updateDateTime(date, preset.value);
                            }}
                            className={`btn btn-outline btn-xs ${time === preset.value ? 'btn-active' : ''}`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Affichage de la date/heure combinée */}
            {date && time && (
                <div className="text-sm text-base-content/70 mt-2">
                    <span className="font-medium">Sélectionné:</span> {
                    new Date(`${date}T${time}`).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }
                </div>
            )}

            {error && (
                <div className="text-error text-sm mt-1">{error}</div>
            )}
        </div>
    );
};

// Composant pour suggérer une durée
export const DurationSuggestions = ({ startTime, onDurationSelect }) => {
    if (!startTime) return null;

    const durations = [
        { label: '1h', hours: 1 },
        { label: '1h30', hours: 1.5 },
        { label: '2h', hours: 2 },
        { label: '3h', hours: 3 },
        { label: '4h', hours: 4 },
        { label: 'Journée', hours: 8 },
    ];

    const calculateEndTime = (hours) => {
        const start = new Date(startTime);
        const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
        return end.toISOString().slice(0, 16);
    };

    return (
        <div className="bg-base-200 p-3 rounded-lg">
            <span className="text-sm font-medium text-base-content/70">Durée suggérée:</span>
            <div className="flex flex-wrap gap-2 mt-2">
                {durations.map((duration) => (
                    <button
                        key={duration.label}
                        type="button"
                        onClick={() => onDurationSelect(calculateEndTime(duration.hours))}
                        className="btn btn-outline btn-xs"
                    >
                        {duration.label}
                    </button>
                ))}
            </div>
        </div>
    );
};