export const UserSelector = ({
                                 onSelectUser,
                                 selectedUserId
                             }: {
    onSelectUser: (user: UserSummary) => void;
    selectedUserId?: string;
}) => {
    const { users, isLoading, searchTerm, setSearchTerm, hasSearchTerm } = useUserSearch(20);

    return (
        <div className="space-y-4">
            <div>
                <label className="label">
                    <span className="label-text text-lg font-medium">Rechercher un client</span>
                </label>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tapez un nom ou email..."
                    className="input input-bordered input-lg w-full text-xl"
                />
            </div>

            {isLoading ? (
                <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-md"></span>
                </div>
            ) : (
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {users.length === 0 ? (
                        <div className="text-center py-8 text-base-content/50">
                            {hasSearchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => onSelectUser(user)}
                                className={`card cursor-pointer transition-all hover:shadow-md ${
                                    selectedUserId === user.id
                                        ? 'bg-primary text-primary-content shadow-lg'
                                        : 'bg-base-100 hover:bg-base-200'
                                }`}
                            >
                                <div className="card-body compact">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg">{user.fullName}</h3>
                                            <p className="text-sm opacity-70">@{user.username}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm opacity-70">{user.email}</p>
                                            {selectedUserId === user.id && (
                                                <div className="badge badge-accent">Sélectionné</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};