
import React, { useState, useCallback, useMemo } from 'react';
import type { Garment } from '../types';
import ImageUploader from './ImageUploader';
import GarmentCard from './GarmentCard';
import { processGarmentImage } from '../services/geminiService';
import Loader from './Loader';
import GarmentEditor from './GarmentEditor';

interface ClosetViewProps {
  wardrobe: Garment[];
  addGarment: (garment: Garment) => void;
  deleteGarment: (garmentId: string) => void;
  updateGarment: (garmentId: string, updatedData: Partial<Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>>) => void;
  setError: (message: string | null) => void;
}

const TOP_CATEGORIES = ['T-Shirt', 'Shirt', 'Blouse', 'Sweater', 'Hoodie', 'Top', 'Jacket', 'Coat', 'Blazer', 'Cardigan', 'Vest', 'Polo', 'Tank Top'];
const BOTTOM_CATEGORIES = ['Jeans', 'Pants', 'Shorts', 'Skirt', 'Leggings', 'Trousers', 'Sweatpants', 'Chinos'];
const FULL_BODY_CATEGORIES = ['Dress', 'Jumpsuit', 'Romper'];
const FOOTWEAR_CATEGORIES = ['Shoes', 'Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers'];


const ClosetView: React.FC<ClosetViewProps> = ({ wardrobe, addGarment, deleteGarment, updateGarment, setError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('AI is analyzing your item...');
  const [editingGarment, setEditingGarment] = useState<Garment | null>(null);

  const handleImageUpload = useCallback(async (imageDataUrl: string, file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingMessage('Analyzing style, color, and season...');
      const base64Data = imageDataUrl.split(',')[1];
      const garmentData = await processGarmentImage(base64Data, file.type);
      
      const newGarment: Garment = {
        ...garmentData,
        id: `${Date.now()}-${file.name}`,
        imageData: imageDataUrl,
      };

      addGarment(newGarment);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setError(`Failed to process image: ${errorMessage}`);
      console.error(error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('AI is analyzing your item...');
    }
  }, [addGarment, setError]);
  
  const handleSaveGarment = useCallback((garmentId: string, updatedData: Partial<Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>>) => {
    updateGarment(garmentId, updatedData);
    setEditingGarment(null);
  }, [updateGarment]);

  const { tops, bottoms, fullBody, footwear, other } = useMemo(() => {
    const tops: Garment[] = [];
    const bottoms: Garment[] = [];
    const fullBody: Garment[] = [];
    const footwear: Garment[] = [];
    const other: Garment[] = [];

    wardrobe.forEach(garment => {
      const categoryLower = garment.category.toLowerCase();
      if (TOP_CATEGORIES.some(cat => categoryLower.includes(cat.toLowerCase()))) {
        tops.push(garment);
      } else if (BOTTOM_CATEGORIES.some(cat => categoryLower.includes(cat.toLowerCase()))) {
        bottoms.push(garment);
      } else if (FULL_BODY_CATEGORIES.some(cat => categoryLower.includes(cat.toLowerCase()))) {
        fullBody.push(garment);
      } else if (FOOTWEAR_CATEGORIES.some(cat => categoryLower.includes(cat.toLowerCase()))) {
        footwear.push(garment);
      } else {
        other.push(garment);
      }
    });
    return { tops, bottoms, fullBody, footwear, other };
  }, [wardrobe]);

  const GarmentGrid: React.FC<{ garments: Garment[] }> = ({ garments }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {garments.map(garment => (
        <GarmentCard key={garment.id} garment={garment} onDelete={deleteGarment} onEdit={setEditingGarment} />
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Closet</h2>
        <p className="text-gray-600">Upload pictures of your clothes to build your digital wardrobe.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">Add New Item</h3>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg">
            <Loader />
            <p className="mt-4 text-gray-600 font-medium text-center">{loadingMessage}</p>
          </div>
        ) : (
          <ImageUploader onUpload={handleImageUpload} />
        )}
      </div>

      <div>
        {wardrobe.length > 0 ? (
          <div className="space-y-10">
            {tops.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Tops</h3>
                <GarmentGrid garments={tops} />
              </section>
            )}
            {bottoms.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Bottoms</h3>
                <GarmentGrid garments={bottoms} />
              </section>
            )}
            {fullBody.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Full Body</h3>
                <GarmentGrid garments={fullBody} />
              </section>
            )}
             {footwear.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Footwear</h3>
                <GarmentGrid garments={footwear} />
              </section>
            )}
            {other.length > 0 && (
              <section>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Other</h3>
                <GarmentGrid garments={other} />
              </section>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Your closet is empty!</h3>
              <p className="mt-2 text-gray-500">Start by adding your first clothing item above.</p>
            </div>
          )
        )}
      </div>
       {editingGarment && (
        <GarmentEditor
          garment={editingGarment}
          onSave={handleSaveGarment}
          onClose={() => setEditingGarment(null)}
        />
      )}
    </div>
  );
};

export default ClosetView;