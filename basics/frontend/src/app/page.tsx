export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Example messages (can be removed or replaced with dynamic content later) */}
        <div className="flex justify-start">
          <div className="bg-blue-500 text-white rounded-lg p-3 max-w-xs">
            Hello! How can I help you today?
          </div>
        </div>
        <div className="flex justify-end">
          <div className="bg-green-500 text-white rounded-lg p-3 max-w-xs">
            Hi there! I have a question.
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white p-4 shadow-md">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-lg p-3 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-6 py-3 focus:outline-none">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
