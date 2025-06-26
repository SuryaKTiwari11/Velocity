function Bar({ progress }) {
  return (
    <div className="w-full bg-gray-300 h-4">
      <div
        className="bg-blue-500 h-4"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

export default Bar;