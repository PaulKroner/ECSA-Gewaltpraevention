import React from 'react';
import LoadingSpinner from "./LoadingContainer/LoadingSpinner";

const SubmitButton = ({ text, loading }) => {
  return (
    <>
      <div className="flex justify-center w-full">
        <button
          className="flex flex-row justify-center items-center bg-blue-500 text-white py-2 px-4 rounded-full w-64 text-3xl font-semibold shadow-lg shadow-neutral-500 disabled:opacity-50"
          type="submit"
          disabled={loading}
          >
          {loading ? (
            <>
              <LoadingSpinner spinnerWidht={"w-6"} spinnerHeight={"h-6"} color={"text-white"} />
            </>
          ) : (
            <></>
          )}
          <span>{text}</span>
        </button>
      </div>
    </>
  )
};

export default SubmitButton;