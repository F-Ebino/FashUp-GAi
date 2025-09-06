import React, { useState } from 'react';
import type { Avatar, Garment, Outfit } from '../types';
import AvatarDisplay from './AvatarDisplay';
import AiGarmentGenerator from './AiGarmentGenerator';

interface MirrorViewProps {
  avatar: Avatar | null;
  wardrobe: Garment[];
  outfit: Outfit | null;
  addGarment: (garment: Garment) => void;
  onClearOutfit: () => void;
}

const MirrorView: React.FC<MirrorViewProps> = ({ avatar, wardrobe, outfit, addGarment, onClearOutfit }) => {
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handleGarmentCreated = (garmentData: Omit<Garment, 'id'>) => {
    const newGarment: Garment = {
      ...garmentData,
      id: `${Date.now()}-ai-generated`,
    };
    addGarment(newGarment);
    setIsGeneratorOpen(false);
  };

  if (!avatar) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Create Your Avatar</h2>
        <p className="mt-4 text-gray-600 max-w-md mx-auto">
          To use the virtual mirror, please go to the 'Avatar' tab and create your digital self first.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Virtual Mirror</h2>
          <p className="text-gray-600">Try on outfits suggested by the AI or create new garments from your imagination.</p>
        </div>
        
        <div className="relative">
          <AvatarDisplay 
            avatar={avatar} 
            wardrobe={wardrobe} 
            outfit={outfit}
            onShowAiGenerator={() => setIsGeneratorOpen(true)}
            onClearOutfit={onClearOutfit}
          />
        </div>
      </div>

      {isGeneratorOpen && (
        <AiGarmentGenerator
          onClose={() => setIsGeneratorOpen(false)}
          onGarmentCreated={handleGarmentCreated}
        />
      )}
    </>
  );
};

export default MirrorView;