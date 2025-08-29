import {useState} from "react";

export const QuickCreateUserButton = ({
                                          onCreateUser
                                      }: {
    onCreateUser: (name: string) => void
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [guestName, setGuestName] = useState('');

    if (!isCreating) {
        return (
            <button
                onClick={() => setIsCreating(true)}
                className="btn btn-outline btn-lg w-full"
            >
                + Nouveau client / Client occasionnel
            </button>
        );
    }

    return (
        <div className="space-y-3">
            <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Nom du client occasionnel"
                className="input input-bordered input-lg w-full"
                autoFocus
            />
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        if (guestName.trim()) {
                            onCreateUser(guestName.trim());
                            setGuestName('');
                            setIsCreating(false);
                        }
                    }}
                    disabled={!guestName.trim()}
                    className="btn btn-success flex-1"
                >
                    Valider
                </button>
                <button
                    onClick={() => {
                        setIsCreating(false);
                        setGuestName('');
                    }}
                    className="btn btn-ghost"
                >
                    Annuler
                </button>
            </div>
        </div>
    );
};