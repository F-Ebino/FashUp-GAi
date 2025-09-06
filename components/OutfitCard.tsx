
import React from 'react';
import type { Garment, Outfit } from '../types';
import GarmentCard from './GarmentCard';
import { SparklesIcon } from './icons/SparklesIcon';

interface OutfitCardProps {
  outfit: Outfit;
  wardrobe: Garment[];
  title?: string;
  children?: React.ReactNode;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, wardrobe, title, children }) => {
  const outfitGarments = wardrobe.filter(garment => outfit.outfitGarmentIds.includes(garment.id));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-fade-in space-y-6">
      <div>
        {title ? (
          <h3 className="text-xl font-semibold mb-1 text-gray-900 capitalize">{title}</h3>
        ) : (
          <h3 className="text-xl font-semibold text-gray-900">Here's your outfit!</h3>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {outfitGarments.map(garment => (
            <GarmentCard key={garment.id} garment={garment} />
          ))}
        </div>
      </div>

      <div className="bg-fuchsia-50 border-l-4 border-fuchsia-400 p-4 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <SparklesIcon className="h-5 w-5 text-fuchsia-500" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-semibold text-fuchsia-800">Stylist's Note</p>
            <p className="mt-1 text-sm text-fuchsia-700">{outfit.reasoning}</p>
          </div>
        </div>
      </div>

      {children && (
        <div className="pt-6 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default OutfitCard;