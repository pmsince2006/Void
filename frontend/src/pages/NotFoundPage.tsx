import React from 'react';
import { Button } from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1 flex flex-col items-center justify-center text-center">
      <span className="text-xs font-mono tracking-widest text-[#777777] uppercase mb-2">
        ERROR PROTOCOL 404
      </span>
      <h1 className="font-display text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-[#111111] mb-4">
        COORDINATES VOID
      </h1>
      <p className="font-mono text-xs text-[#777777] max-w-md mb-8">
        The requested transmission vector does not exist or has been cleared from active memory.
      </p>
      <Button variant="solid" to="/" size="md">
        RETURN TO VOID HOMEPAGE
      </Button>
    </div>
  );
};
