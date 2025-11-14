// Ejemplo de cómo mostrar la foto y datos en la card del leaderboard

{/* Dentro del map de filteredLeaderboard en el leaderboard: */}
{filteredLeaderboard.map((entry, index) => {
  const tier = getTierConfig(entry.degenScore);
  const isTop3 = index < 3;

  return (
    <div key={entry.id} className="...">
      {/* Header con foto de perfil */}
      <div className="flex items-center justify-between mb-4">
        {/* Foto de perfil */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/50 overflow-hidden bg-gray-800">
            {entry.profileImage ? (
              <img
                src={entry.profileImage}
                alt={entry.displayName || 'Profile'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl">
                👤
              </div>
            )}
          </div>

          {/* Nombre y wallet */}
          <div>
            {entry.displayName && (
              <div className="text-white font-bold text-lg">
                {entry.displayName}
              </div>
            )}
            <div className="text-xs text-gray-400 font-mono">
              {entry.walletAddress.slice(0, 4)}...{entry.walletAddress.slice(-4)}
            </div>
          </div>
        </div>

        {/* Rank badge */}
        <div className="flex items-center gap-2">
          {index === 0 && <span className="text-3xl">🥇</span>}
          {index === 1 && <span className="text-3xl">🥈</span>}
          {index === 2 && <span className="text-3xl">🥉</span>}
          <span className={`text-2xl font-bold ${isTop3 ? 'text-yellow-400' : 'text-gray-400'}`}>
            #{index + 1}
          </span>
        </div>
      </div>

      {/* Score y stats (tu código existente) */}
      <div className="text-center mb-4">
        <div className={`text-7xl font-black bg-gradient-to-br ${tier.gradient} bg-clip-text text-transparent`}>
          {entry.degenScore}
        </div>
      </div>

      {/* Redes sociales (si las tiene) */}
      {(entry.twitter || entry.telegram) && (
        <div className="flex justify-center gap-3 mb-4">
          {entry.twitter && (
            <a
              href={`https://twitter.com/${entry.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 hover:text-cyan-400 transition"
            >
              🐦 @{entry.twitter}
            </a>
          )}
          {entry.telegram && (
            <a
              href={`https://t.me/${entry.telegram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-gray-800/50 rounded-full text-xs text-gray-300 hover:text-cyan-400 transition"
            >
              ✈️ @{entry.telegram}
            </a>
          )}
        </div>
      )}

      {/* Resto de la card... */}
    </div>
  );
})}
