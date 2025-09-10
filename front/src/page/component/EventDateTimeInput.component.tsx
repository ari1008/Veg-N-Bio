import React, {useEffect, useState} from "react";

export const EventDateTimeInput = ({ label, error, value, onChange, min, placeholder }) => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');

    useEffect(() => {
        if (value) {
            if (value.includes('T')) {
                const [datePart, timePart] = value.split('T');
                setDate(datePart);
                setTime(timePart.slice(0, 5));
            } else {
                const dateObj = new Date(value + 'T00:00:00');
                setDate(dateObj.getFullYear() + '-' +
                    String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
                    String(dateObj.getDate()).padStart(2, '0'));
                setTime(String(dateObj.getHours()).padStart(2, '0') + ':' +
                    String(dateObj.getMinutes()).padStart(2, '0'));
            }
        }
    }, [value]);

    const updateDateTime = (newDate, newTime) => {
        if (newDate && newTime) {
            const combined = `${newDate}T${newTime}:00`;
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

    const setToday = () => {
        const today = new Date();
        const todayStr = today.getFullYear() + '-' +
            String(today.getMonth() + 1).padStart(2, '0') + '-' +
            String(today.getDate()).padStart(2, '0');
        setDate(todayStr);
        updateDateTime(todayStr, time || '10:00');
    };

    const setNextWeek = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.getFullYear() + '-' +
            String(nextWeek.getMonth() + 1).padStart(2, '0') + '-' +
            String(nextWeek.getDate()).padStart(2, '0');
        setDate(nextWeekStr);
        updateDateTime(nextWeekStr, time || '10:00');
    };

    const setNextMonth = () => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        const nextMonthStr = nextMonth.getFullYear() + '-' +
            String(nextMonth.getMonth() + 1).padStart(2, '0') + '-' +
            String(nextMonth.getDate()).padStart(2, '0');
        setDate(nextMonthStr);
        updateDateTime(nextMonthStr, time || '10:00');
    };

    const timePresets = [
        { label: '9h00', value: '09:00' },
        { label: '10h00', value: '10:00' },
        { label: '14h00', value: '14:00' },
        { label: '15h00', value: '15:00' },
        { label: '18h00', value: '18:00' },
        { label: '19h00', value: '19:00' },
    ];

    const minDate = min ?
        (typeof min === 'string' ? min.split('T')[0] : new Date(min).toISOString().split('T')[0]) :
        new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="label">
                        <span className="label-text">Date</span>
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        min={minDate}
                        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                    />
                </div>
                <div>
                    <label className="label">
                        <span className="label-text">Heure</span>
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
                    />
                </div>
            </div>

            {/* Raccourcis de dates */}
            <div className="bg-base-200 p-3 rounded-lg">
                <span className="text-sm font-medium text-base-content/70">Raccourcis de dates:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                    <button
                        type="button"
                        onClick={setToday}
                        className="btn btn-outline btn-xs"
                    >
                        Aujourd'hui
                    </button>
                    <button
                        type="button"
                        onClick={setNextWeek}
                        className="btn btn-outline btn-xs"
                    >
                        Semaine prochaine
                    </button>
                    <button
                        type="button"
                        onClick={setNextMonth}
                        className="btn btn-outline btn-xs"
                    >
                        Mois prochain
                    </button>
                </div>
            </div>

            {/* Raccourcis horaires */}
            {date && (
                <div className="bg-base-200 p-3 rounded-lg">
                    <span className="text-sm font-medium text-base-content/70">Heures courantes:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
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
                </div>
            )}

            {/* Affichage de la date/heure combinée - CORRIGÉ */}
            {date && time && (
                <div className="text-sm text-base-content/70 mt-2">
                    <span className="font-medium">Sélectionné:</span> {
                    new Date(
                        parseInt(date.split('-')[0]), // année
                        parseInt(date.split('-')[1]) - 1, // mois (0-indexé)
                        parseInt(date.split('-')[2]), // jour
                        parseInt(time.split(':')[0]), // heure
                        parseInt(time.split(':')[1])  // minute
                    ).toLocaleDateString('fr-FR', {
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