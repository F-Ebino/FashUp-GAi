import React, { useState, useMemo, useEffect } from 'react';
import type { Avatar, Garment, Outfit } from '../types';
import RealisticAvatar from './RealisticAvatar';
import { EditIcon } from './icons/EditIcon';
import { SparklesIcon } from './icons/SparklesIcon';

const GARMENT_Z_INDEX: { [key: string]: number } = {
  // Footwear is lowest layer
  'Shoes': 5, 'Sneakers': 5, 'Boots': 5, 'Sandals': 5, 'Heels': 5, 'Flats': 5, 'Loafers': 5,
  // Bottoms
  'Jeans': 10, 'Pants': 10, 'Shorts': 10, 'Skirt': 10, 'Leggings': 10, 'Trousers': 10, 'Sweatpants': 10,
  // Full Body garments like dresses sit above bottoms but below most tops
  'Dress': 15, 'Jumpsuit': 15, 'Romper': 15,
  // Base layer tops
  'T-Shirt': 20, 'Shirt': 20, 'Blouse': 20, 'Top': 20, 'Polo': 20, 'Tank Top': 20,
  // Mid-layers that go over base tops
  'Sweater': 25, 'Hoodie': 26, 'Vest': 28,
  // Outerwear, with a clear progression from lightest to heaviest
  'Cardigan': 30,
  'Blazer': 35,
  'Jacket': 40,
  'Coat': 45, // The outermost layer
};
const DEFAULT_Z_INDEX = 18; // Places unknown items logically between full-body and tops.

// Base styles provide a starting point for positioning garments.
const GARMENT_STYLES: Record<string, React.CSSProperties> = {
  // Tops
  'T-Shirt': { top: '24%', height: '25%', width: '38%' },
  'Shirt': { top: '24%', height: '30%', width: '40%' },
  'Blouse': { top: '24%', height: '28%', width: '40%' },
  'Sweater': { top: '23%', height: '32%', width: '45%' },
  'Hoodie': { top: '23%', height: '34%', width: '46%' },
  'Top': { top: '24%', height: '25%', width: '38%' },
  // Outerwear
  'Jacket': { top: '23%', height: '35%', width: '48%' },
  'Coat': { top: '23%', height: '55%', width: '50%' },
  'Blazer': { top: '23%', height: '38%', width: '46%' },
  'Cardigan': { top: '23%', height: '40%', width: '46%' },
  'Vest': { top: '24%', height: '30%', width: '40%' },
  // Bottoms
  'Jeans': { top: '48%', height: '50%', width: '35%' },
  'Pants': { top: '48%', height: '50%', width: '35%' },
  'Trousers': { top: '48%', height: '50%', width: '35%' },
  'Sweatpants': { top: '48%', height: '50%', width: '38%' },
  'Shorts': { top: '48%', height: '25%', width: '38%' },
  'Skirt': { top: '48%', height: '35%', width: '40%' },
  'Leggings': { top: '48%', height: '50%', width: '30%' },
  // Full Body
  'Dress': { top: '24%', height: '60%', width: '42%' },
  'Jumpsuit': { top: '24%', height: '70%', width: '42%' },
  // Shoes
  'Shoes': { top: '90%', height: '10%', width: '38%' },
  'Sneakers': { top: '90%', height: '10%', width: '38%' },
  'Boots': { top: '88%', height: '12%', width: '38%' },
  'Sandals': { top: '92%', height: '8%', width: '36%' },
  'Heels': { top: '90%', height: '10%', width: '36%' },
};
const DEFAULT_GARMENT_STYLE: React.CSSProperties = { top: '30%', height: '40%', width: '40%' };

/**
 * Calculates dynamic CSS styles for a garment based on its category and the avatar's measurements.
 * This ensures a more realistic fit by adjusting size and position.
 */
const getGarmentStyle = (category: string, avatar: Avatar): React.CSSProperties => {
    let baseStyle: React.CSSProperties = DEFAULT_GARMENT_STYLE;
    // Find the most appropriate base style for the garment category.
    for (const key in GARMENT_STYLES) {
        if (category.toLowerCase().includes(key.toLowerCase())) {
            baseStyle = GARMENT_STYLES[key];
            break;
        }
    }

    // --- Dynamic Adjustments based on Avatar's measurements ---
    const { bodyShape } = avatar;
    const categoryLower = category.toLowerCase();
    const isTop = ['t-shirt', 'shirt', 'blouse', 'sweater', 'hoodie', 'top', 'jacket', 'coat', 'blazer', 'cardigan', 'vest'].some(cat => categoryLower.includes(cat));
    const isBottom = ['jeans', 'pants', 'shorts', 'skirt', 'leggings', 'trousers', 'sweatpants'].some(cat => categoryLower.includes(cat));

    // 1. Height Adjustment Factor: Taller avatars need longer garments.
    const heightFactor = 0.9 + ((avatar.height - 140) / (210 - 140)) * 0.2;

    // 2. Width Adjustment Factor: A nuanced factor based on garment type and body shape.
    const normalize = (val: number, min: number, max: number) => Math.max(0, Math.min(1, (val - min) / (max - min)));
    const chestNorm = normalize(avatar.chest, 70, 130);
    const waistNorm = normalize(avatar.waist, 70, 130);
    const hipsNorm = normalize(avatar.hips, 70, 130);
    
    let widthMetric;
    if (isTop) {
        // For masculine shapes, chest is more dominant. For feminine/androgynous, it's more balanced.
        const chestWeight = bodyShape === 'masculine' ? 0.7 : 0.6;
        widthMetric = (chestNorm * chestWeight) + (waistNorm * (1 - chestWeight));
    } else if (isBottom) {
        // For feminine shapes, hips are more dominant. For masculine, waist is more so.
        const hipsWeight = bodyShape === 'feminine' ? 0.7 : (bodyShape === 'masculine' ? 0.4 : 0.55);
        widthMetric = (waistNorm * (1 - hipsWeight)) + (hipsNorm * hipsWeight);
    } else {
        // Full body garments or others use a general average.
        widthMetric = (chestNorm + waistNorm + hipsNorm) / 3;
    }
    
    // Scale the 0-1 metric to a reasonable size factor (e.g., 0.85x to 1.15x).
    const widthFactor = 0.85 + (widthMetric * 0.3);

    // Helper to parse string percentages like "25%" into numbers.
    const parsePercent = (val: string | number | undefined): number => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseFloat(val.replace('%', ''));
        return 0;
    };

    const finalStyle: React.CSSProperties = { ...baseStyle, objectFit: 'contain' };
    
    const baseWidth = parsePercent(baseStyle.width);
    const baseHeight = parsePercent(baseStyle.height);
    const baseTop = parsePercent(baseStyle.top);

    // Adjust width and re-calculate 'left' to keep the garment horizontally centered.
    if (baseWidth > 0) {
        const newWidth = baseWidth * widthFactor;
        finalStyle.width = `${newWidth}%`;
        finalStyle.left = `${50 - newWidth / 2}%`;
    }

    // Adjust height and vertical position ('top').
    if (baseHeight > 0 && baseTop > 0) {
        const newHeight = baseHeight * heightFactor;
        finalStyle.height = `${newHeight}%`;

        // Taller avatars have longer torsos, so garments should start lower.
        const heightTopAdjustment = (heightFactor - 1) * (isBottom ? 20 : 10);
        
        // Body shape adjustment: feminine shapes have a higher waistline, masculine a lower one.
        let shapeTopAdjustment = 0;
        if (isBottom) {
            if (bodyShape === 'feminine') shapeTopAdjustment = -1.5; // Move up
            if (bodyShape === 'masculine') shapeTopAdjustment = 1; // Move down
        } else if (isTop) {
             if (bodyShape === 'feminine') shapeTopAdjustment = -1; // Move up slightly
        }
        
        finalStyle.top = `${baseTop + heightTopAdjustment + shapeTopAdjustment}%`;
    }
    
    return finalStyle;
};


interface AvatarDisplayProps {
  avatar: Avatar;
  wardrobe: Garment[];
  outfit: Outfit | null;
  onEdit?: () => void;
  onShowAiGenerator?: () => void;
  onClearOutfit?: () => void;
  showClosetPanel?: boolean;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatar, wardrobe, outfit, onEdit, onShowAiGenerator, onClearOutfit, showClosetPanel = true }) => {
  const [wornGarments, setWornGarments] = useState<Garment[]>([]);

  useEffect(() => {
    if (outfit) {
        const garments = wardrobe.filter(g => outfit.outfitGarmentIds.includes(g.id));
        setWornGarments(garments);
    } else {
        // If the outfit prop is explicitly cleared, clear the local state too.
        setWornGarments([]);
    }
  }, [outfit, wardrobe]);

  const toggleGarment = (garment: Garment) => {
    setWornGarments(prev =>
      prev.some(g => g.id === garment.id)
        ? prev.filter(g => g.id !== garment.id)
        : [...prev, garment]
    );
  };

  const handleClearClick = () => {
    if (onClearOutfit) {
      onClearOutfit();
    } else {
      // Fallback for non-controlled component
      setWornGarments([]);
    }
  };

  const sortedWornGarments = useMemo(() => {
    return [...wornGarments].sort((a, b) => {
      const zA = GARMENT_Z_INDEX[a.category] ?? DEFAULT_Z_INDEX;
      const zB = GARMENT_Z_INDEX[b.category] ?? DEFAULT_Z_INDEX;
      return zA - zB;
    });
  }, [wornGarments]);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left Panel: Avatar Display */}
      <div className={`flex-1 ${showClosetPanel ? 'lg:flex-grow-[2]' : ''} bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center`}>
        <div className="relative w-full max-w-sm mx-auto h-[32rem] overflow-hidden rounded-lg bg-gray-100">
            <RealisticAvatar avatar={avatar} />
            {sortedWornGarments.map(garment => (
                <img
                    key={garment.id}
                    src={garment.cutoutImageData}
                    alt={garment.description}
                    className="absolute drop-shadow-lg pointer-events-none"
                    style={{ 
                      ...getGarmentStyle(garment.category, avatar),
                      zIndex: GARMENT_Z_INDEX[garment.category] ?? DEFAULT_Z_INDEX
                    }}
                />
            ))}
        </div>
        <div className="mt-4 flex justify-center items-center gap-4">
            {onEdit && (
                <button
                    onClick={onEdit}
                    className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-80 transition-colors text-sm flex items-center gap-2"
                >
                    <EditIcon className="w-4 h-4" />
                    Edit Avatar
                </button>
            )}
            {wornGarments.length > 0 && (
                <button
                onClick={handleClearClick}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors text-sm"
                >
                Clear Outfit
                </button>
            )}
        </div>
      </div>

      {/* Right Panel: Wardrobe */}
      {showClosetPanel && (
        <div className="flex-1 lg:max-w-md">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Your Closet</h3>
                {onShowAiGenerator && (
                    <button
                        onClick={onShowAiGenerator}
                        className="flex items-center gap-2 text-sm font-semibold text-brand-accent hover:text-brand-accent-hover transition-colors"
                        title="Create a new clothing item with AI"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Create with AI
                    </button>
                )}
              </div>
              {wardrobe.length > 0 ? (
                  <div className="max-h-[32rem] overflow-y-auto pr-2 -mr-2">
                     <div className="grid grid-cols-3 gap-4">
                        {wardrobe.map(garment => (
                          <button
                            key={garment.id}
                            onClick={() => toggleGarment(garment)}
                            className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                            wornGarments.some(g => g.id === garment.id) ? 'border-brand-accent ring-2 ring-brand-accent' : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                              <img src={garment.imageData} alt={garment.description} className="w-full h-full object-cover aspect-square" />
                              <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center p-1">
                                  <p className="text-white text-xs text-center font-semibold">{garment.category}</p>
                              </div>
                          </button>
                        ))}
                      </div>
                  </div>
              ) : (
                  <p className="text-gray-500">Your closet is empty. Go to the 'Closet' tab to add items.</p>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDisplay;