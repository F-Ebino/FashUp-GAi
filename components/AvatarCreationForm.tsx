import React from 'react';
import type { Avatar } from '../types';

interface AvatarFormProps {
  avatar: Avatar;
  setAvatar: React.Dispatch<React.SetStateAction<Avatar>>;
  onSave: () => void;
  onCancel?: () => void;
  isEditing: boolean;
}

const avatarOptions = {
  bodyShapes: ['masculine', 'feminine', 'androgynous'] as const,
  skinTones: ['#f2d0b1', '#d4aa7c', '#c78d58', '#a06a42', '#8c5a3c', '#5a3825'],
  hairColors: ['#090806', '#4a3223', '#b88b6b', '#e6c8a2', '#d35a40', '#9e9e9e', '#fefefe'],
  hairStyles: ['short', 'long', 'bun', 'bald'] as const,
  faceShapes: ['oval', 'round', 'square'] as const,
  eyeColors: ['#8c5a3c', '#4a3223', '#667a48', '#4169e1', '#9e9e9e'],
  facialHairs: ['none', 'mustache', 'goatee', 'beard'] as const,
  bodyTypes: ['slim', 'fit', 'muscular', 'curvy', 'plus-size'] as const,
};

// Defines target proportional ratios for different body types and shapes.
// whr: Waist-to-Hip Ratio (lower is more hourglass/pear, higher is more straight/apple)
// cwr: Chest-to-Waist Ratio (higher is more V-shaped/hourglass)
const BODY_TYPE_RATIOS: Record<Avatar['bodyShape'], Record<Avatar['bodyType'], { whr: number; cwr: number }>> = {
  masculine: {
    slim:       { whr: 0.90, cwr: 1.175 },
    fit:        { whr: 0.85, cwr: 1.275 },
    muscular:   { whr: 0.85, cwr: 1.40 },
    curvy:      { whr: 0.95, cwr: 1.075 }, // Broad/Stocky build
    'plus-size':{ whr: 1.025, cwr: 1.05 },
  },
  feminine: {
    slim:       { whr: 0.80, cwr: 1.175 },
    fit:        { whr: 0.75, cwr: 1.275 },
    muscular:   { whr: 0.80, cwr: 1.375 },
    curvy:      { whr: 0.715, cwr: 1.20 },
    'plus-size':{ whr: 0.865, cwr: 1.10 },
  },
  androgynous: {
    slim:       { whr: 0.85, cwr: 1.175 },
    fit:        { whr: 0.83, cwr: 1.225 },
    muscular:   { whr: 0.85, cwr: 1.325 },
    curvy:      { whr: 0.815, cwr: 1.15 },
    'plus-size':{ whr: 0.925, cwr: 1.075 },
  }
};

/**
 * Calculates chest, waist, and hips measurements based on height, weight, and body type ratios.
 */
const calculateBodyMeasurements = (height: number, weight: number, bodyShape: Avatar['bodyShape'], bodyType: Avatar['bodyType']): { chest: number; waist: number; hips: number } => {
    if (height <= 0 || weight <= 0) {
        return { chest: 100, waist: 85, hips: 95 }; // Return defaults for invalid inputs
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    // 1. Estimate a base waist circumference from BMI. This is a heuristic formula.
    const baseWaist = 35 + (bmi * 1.8); 
    // 2. Scale this waist measurement relative to a baseline height (e.g., 170cm).
    const scaledWaist = baseWaist * (height / 170);

    // 3. Get the target proportional ratios for the selected body type.
    const ratios = BODY_TYPE_RATIOS[bodyShape][bodyType];

    // 4. Calculate final chest and hips based on the estimated waist and target ratios.
    const waist = Math.round(scaledWaist);
    const chest = Math.round(waist * ratios.cwr);
    const hips = Math.round(waist / ratios.whr);

    return { chest, waist, hips };
};


const OptionButton: React.FC<{
  isSelected: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ isSelected, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg border-2 transition-all duration-200 ${
      isSelected ? 'border-brand-accent ring-2 ring-brand-accent' : 'border-gray-200 hover:border-gray-400'
    } ${className}`}
    aria-pressed={isSelected}
    disabled={!onClick}
  >
    {children}
  </button>
);

const AvatarForm: React.FC<AvatarFormProps> = ({ avatar, setAvatar, onSave, onCancel, isEditing }) => {
  
  // A single handler to update avatar state and recalculate measurements
  const handleStateChange = (updates: Partial<Avatar>) => {
    setAvatar(prev => {
        const newState = { ...prev, ...updates };
        // Any change to a core physical attribute requires recalculation of body measurements.
        const { height, weight, bodyShape, bodyType } = newState;
        const newMeasurements = calculateBodyMeasurements(height, weight, bodyShape, bodyType);
        return { ...newState, ...newMeasurements };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Body Shape */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Body Shape</h3>
        <div className="flex flex-wrap gap-3">
          {avatarOptions.bodyShapes.map(shape => (
            <OptionButton key={shape} isSelected={avatar.bodyShape === shape} onClick={() => handleStateChange({ bodyShape: shape })} className="capitalize font-semibold px-4 py-2 text-sm">
              {shape}
            </OptionButton>
          ))}
        </div>
      </div>
      
      {/* Appearance Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Skin Tone</h3>
        <div className="flex flex-wrap gap-3">
          {avatarOptions.skinTones.map(color => (
            <OptionButton key={color} isSelected={avatar.skinTone === color} onClick={() => handleStateChange({ skinTone: color })}>
              <div className="w-8 h-8 rounded-full" style={{ backgroundColor: color }} />
              <span className="sr-only">{color}</span>
            </OptionButton>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />
      
      {/* Head & Face Section */}
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-gray-800">Head & Face</h3>
         <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Face Shape</h4>
          <div className="flex flex-wrap gap-3">
            {avatarOptions.faceShapes.map(shape => (
              <OptionButton key={shape} isSelected={avatar.faceShape === shape} onClick={() => handleStateChange({ faceShape: shape })} className="capitalize font-semibold px-4 py-2 text-sm">
                {shape}
              </OptionButton>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Eye Color</h4>
          <div className="flex flex-wrap gap-3">
            {avatarOptions.eyeColors.map(color => (
              <OptionButton key={color} isSelected={avatar.eyeColor === color} onClick={() => handleStateChange({ eyeColor: color })}>
                <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                <span className="sr-only">{color}</span>
              </OptionButton>
            ))}
          </div>
        </div>
         <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Hair Style</h4>
          <div className="flex flex-wrap gap-3">
            {avatarOptions.hairStyles.map(style => (
              <OptionButton key={style} isSelected={avatar.hairStyle === style} onClick={() => handleStateChange({ hairStyle: style })} className="capitalize font-semibold px-4 py-2 text-sm">
                {style}
              </OptionButton>
            ))}
          </div>
        </div>
        {avatar.hairStyle !== 'bald' && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Hair Color</h4>
            <div className="flex flex-wrap gap-3">
              {avatarOptions.hairColors.map(color => (
                <OptionButton key={color} isSelected={avatar.hairColor === color} onClick={() => handleStateChange({ hairColor: color })}>
                  <div className="w-8 h-8 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
                  <span className="sr-only">{color}</span>
                </OptionButton>
              ))}
            </div>
          </div>
        )}
        {avatar.bodyShape !== 'feminine' && (
           <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Facial Hair</h4>
            <div className="flex flex-wrap gap-3">
              {avatarOptions.facialHairs.map(style => (
                <OptionButton key={style} isSelected={avatar.facialHair === style} onClick={() => handleStateChange({ facialHair: style })} className="capitalize font-semibold px-4 py-2 text-sm">
                  {style}
                </OptionButton>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Body Measurements Section */}
      <div className="space-y-4">
         <h3 className="text-lg font-semibold text-gray-800">Body Measurements</h3>
         <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Body Type</h4>
          <div className="flex flex-wrap gap-3">
            {avatarOptions.bodyTypes.map(type => (
              <OptionButton 
                key={type} 
                isSelected={avatar.bodyType === type} 
                onClick={() => handleStateChange({ bodyType: type })}
                className="capitalize font-semibold px-4 py-2 text-sm"
              >
                {type}
              </OptionButton>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 pt-2">
            <div>
              <label htmlFor="height-slider" className="block text-sm font-medium text-gray-700 mb-2">Height: <span className="font-bold">{avatar.height} cm</span></label>
              <input id="height-slider" type="range" min="140" max="210" value={avatar.height} onChange={(e) => handleStateChange({ height: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent" aria-label={`Height: ${avatar.height} cm`} />
            </div>
            <div>
              <label htmlFor="weight-slider" className="block text-sm font-medium text-gray-700 mb-2">Weight: <span className="font-bold">{avatar.weight} kg</span></label>
              <input id="weight-slider" type="range" min="40" max="150" value={avatar.weight} onChange={(e) => handleStateChange({ weight: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent" aria-label={`Weight: ${avatar.weight} kg`} />
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <button
          type="submit"
          className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-brand-accent-hover transition-colors"
        >
          {isEditing ? 'Save Changes' : 'Save & Create Avatar'}
        </button>
        {onCancel && (
            <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
            Cancel
            </button>
        )}
      </div>
    </form>
  );
};

export default AvatarForm;