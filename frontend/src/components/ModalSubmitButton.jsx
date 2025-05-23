import LoadingSpinner from "./LoadingContainer/LoadingSpinner";

const ModalSubmitButton = ({ text, loading }) => {
  return (
    <>
      <div>
        <div
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <LoadingSpinner spinnerWidht={"w-4"} spinnerHeight={"h-4"} color={"text-white"} />
            </>
          ) : (
            <></>
          )}
          <span>{text}</span>
        </div>
      </div>
    </>
  )
}

export default ModalSubmitButton;