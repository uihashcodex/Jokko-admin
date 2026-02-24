import { useState } from "react";

export default function TwoGrid() {
  const [showSecond, setShowSecond] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2">

      {/* GRID 1 */}
      <div
        className={`bg-green-300 min-h-screen ${
          showSecond ? "hidden md:block" : "block"
        }`}
      >
        <div className="p-5">
          <h1>Grid 1</h1>

          {/* Show button only on mobile */}
          <button
            className="mt-4 px-4 py-2 bg-black text-white rounded md:hidden"
            onClick={() => setShowSecond(true)}
          >
            Go To Grid 2
          </button>
        </div>
      </div>

      {/* GRID 2 */}
      <div
        className={`bg-green-500 min-h-screen ${
          showSecond ? "block" : "hidden md:block"
        }`}
      >
        <div className="p-5">
          <h1>Grid 2</h1>

          {/* Back button only on mobile */}
          <button
            className="mt-4 px-4 py-2 bg-black text-white rounded md:hidden"
            onClick={() => setShowSecond(false)}
          >
            Back
          </button>
        </div>
      </div>

    </div>
  );
}
