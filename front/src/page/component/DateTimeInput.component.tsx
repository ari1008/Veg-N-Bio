import {useEffect, useState} from "react";

export const DateTimeInput = ({ label, error, value, onChange, min, placeholder }) => {
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
        updateDateTime(todayStr, time || '09:00');
    };

    const setTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.getFullYear() + '-' +
            String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
            String(tomorrow.getDate()).padStart(2, '0');
        setDate(tomorrowStr);
        updateDateTime(tomorrowStr, time || '09:00');
    };

    const setNextWeek = () => {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.getFullYear() + '-' +
            String(nextWeek.getMonth() + 1).padStart(2, '0') + '-' +
            String(nextWeek.getDate()).padStart(2, '0');
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

    const minDate = min ?
        (typeof min === 'string' ? min.split('T')[0] : new Date(min).toISOString().split('T')[0]) :
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