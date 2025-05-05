import eclogo from '../../lib/Ec11.svg.png';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-ec">
      <div className="bg-white flex flex-col items-center justify-center gap-6 p-12 rounded-2xl">
        <img src={eclogo} alt="EC Logo" className="h-32 w-32"/>
        <h1 className="text-3xl">Fehler 404: Seite nicht gefunden!</h1>
      </div>
    </div>
  );
}

export default NotFoundPage;