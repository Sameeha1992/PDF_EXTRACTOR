import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#5A0F3D]">
      <div className="text-white text-lg font-medium tracking-wider animate-pulse">
        Loading...
      </div>
    </div>
  );
};

export default Loader;
