'use client';

export default function CreatorProfile() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200 mb-4">
      <h3 className="font-semibold text-gray-900 mb-3">👨‍💻 Platform Creator</h3>
      
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          SA
        </div>
        <div>
          <div className="font-bold text-gray-900">Serkan Aydın</div>
          <div className="text-sm text-gray-600">DeFi Developer & AI Enthusiast</div>
          <div className="text-xs text-blue-600">Base Ecosystem Pioneer</div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 border border-gray-200">
        <div className="text-sm text-gray-700 mb-2">
          🏆 <strong>Achievements:</strong>
        </div>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• First MCP+Base integrated DeFi platform</li>
          <li>• AI-powered DeFi automation pioneer</li>
          <li>• Heurist Network early adopter</li>
          <li>• Base ecosystem developer</li>
        </ul>
      </div>

      <div className="mt-3 text-center">
        <div className="text-xs text-gray-500">
          Built with ❤️ for the DeFi community
        </div>
      </div>
    </div>
  );
}
