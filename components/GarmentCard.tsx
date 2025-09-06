import React from 'react';
import type { Garment } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface GarmentCardProps {
  garment: Garment;
  onDelete?: (id: string) => void;
  onEdit?: (garment: Garment) => void;
}

const GarmentCard: React.FC<GarmentCardProps> = ({ garment, onDelete, onEdit }) => {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 transition-shadow hover:shadow-lg">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img src={garment.imageData} alt={garment.description} className="w-full h-full object-cover object-center" />
      </div>
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-2">
        {onDelete && (
          <button 
            onClick={() => onDelete(garment.id)}
            className="p-1.5 bg-white/70 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 focus:opacity-100"
            aria-label={`Delete ${garment.description}`}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        )}
         {onEdit && (
          <button 
            onClick={() => onEdit(garment)}
            className="p-1.5 bg-white/70 text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-110 focus:opacity-100"
            aria-label={`Edit ${garment.description}`}
          >
            <EditIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{garment.category}</h3>
        <p className="text-xs text-gray-500 mt-1 truncate">{garment.description}</p>
        <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5">
                {garment.colors.slice(0, 3).map((color, index) => (
                    <span key={index} className="block w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color }}></span>
                ))}
            </div>
             <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{garment.season}</span>
        </div>
      </div>
    </div>
  );
};

export default GarmentCard;