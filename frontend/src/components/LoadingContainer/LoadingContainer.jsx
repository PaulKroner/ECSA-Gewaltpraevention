import LoadingSpinner from "./LoadingSpinner";

const LoadingContainer = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="">
        <LoadingSpinner spinnerWidht={"w-36"} spinnerHeight={"h-36"} color={"text-white"} />
      </div>
    </div>
  );
}

export default LoadingContainer;