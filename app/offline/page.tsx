export const metadata = {
  title: 'Offline | THE HATCH',
}

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 text-center">
      <h1 className="text-3xl font-bold">Offline Mode</h1>
      <p>
        You are currently offline. You can still play local Hotseat or Troll games
        without an internet connection. Online features and donations are
        unavailable until you reconnect.
      </p>
      <p>
        To install THE HATCH on your device, use your browser’s “Add to Home
        Screen” or “Install” option.
      </p>
    </div>
  )
}