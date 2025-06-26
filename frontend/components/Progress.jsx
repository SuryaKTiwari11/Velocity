import Bar from "./Doc/Bar";
const statusText = {
  starting: "Starting...",
  movingFile: "Moving file...",
  updatingDb: "Updating database...",
  done: "Done!",
  error: "Error during processing",
};

const Progress = ({ status, progress }) => (
  <div className="my-2">
    <Bar progress={progress} />
    <div className="text-center text-xs mt-1 text-gray-700">
      {statusText[status] || status}
    </div>
  </div>
);

export default Progress;
