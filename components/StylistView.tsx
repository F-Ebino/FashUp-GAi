import React, { useState, useCallback, useMemo } from 'react';
import type { Garment, Outfit, Avatar, SavedOutfit } from '../types';
import { getOutfitSuggestion } from '../services/geminiService';
import Loader from './Loader';
import OutfitCard from './OutfitCard';
import { AvatarIcon } from './icons/AvatarIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import { TrashIcon } from './icons/TrashIcon';
import { SCENARIOS } from '../constants';

interface StylistViewProps {
  wardrobe: Garment[];
  avatar: Avatar | null;
  onTryOn: (outfit: Outfit) => void;
  savedOutfits: SavedOutfit[];
  saveOutfit: (outfit: SavedOutfit) => void;
  deleteSavedOutfit: (outfitId: string) => void;
}

const StylistView: React.FC<StylistViewProps> = ({ wardrobe, avatar, onTryOn, savedOutfits, saveOutfit, deleteSavedOutfit }) => {
  const [scenarioInput, setScenarioInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestedOutfit, setSuggestedOutfit] = useState<Outfit | null>(null);

  const handleGetSuggestion = useCallback(async () => {
    if (!scenarioInput.trim()) {
      setError("Please describe the occasion or your request.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestedOutfit(null);
    try {
      const outfit = await getOutfitSuggestion(wardrobe, scenarioInput);
      if (!outfit.reasoning) {
        outfit.reasoning = 'This outfit is a great choice for the occasion!';
      }
      setSuggestedOutfit(outfit);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [wardrobe, scenarioInput]);

  const handleSaveSuggestion = useCallback(() => {
    if (suggestedOutfit) {
      const defaultTitle = scenarioInput || "My New Look";
      const title = window.prompt("Enter a title for this outfit:", defaultTitle);

      if (title && title.trim()) {
        const newSavedOutfit: SavedOutfit = {
          ...suggestedOutfit,
          id: `outfit-${Date.now()}`,
          title: title.trim(),
        };
        saveOutfit(newSavedOutfit);
      }
    }
  }, [suggestedOutfit, saveOutfit, scenarioInput]);

  const isCurrentOutfitSaved = useMemo(() => {
      if (!suggestedOutfit) return false;
      const currentIds = [...suggestedOutfit.outfitGarmentIds].sort();
      return savedOutfits.some(saved => {
          const savedIds = [...saved.outfitGarmentIds].sort();
          return JSON.stringify(currentIds) === JSON.stringify(savedIds);
      });
  }, [suggestedOutfit, savedOutfits]);

  if (wardrobe.length < 3) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Meet Your AI Stylist</h2>
        <p className="mt-4 text-gray-600 max-w-md mx-auto">
          To get started, please add at least one top, one bottom, and one pair of shoes to your closet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
       <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">AI Stylist</h2>
        <p className="text-gray-600">Describe an occasion or style, and let our AI create the perfect outfit for you from your closet.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div>
          <label htmlFor="scenario-input" className="block text-sm font-medium text-gray-700 mb-1">
            What's the occasion or request?
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {SCENARIOS.map(scenario => (
              <button
                key={scenario}
                type="button"
                onClick={() => setScenarioInput(scenario)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  scenarioInput === scenario
                    ? 'bg-brand-accent text-white shadow-sm ring-2 ring-offset-2 ring-brand-accent'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {scenario}
              </button>
            ))}
          </div>
          <textarea
            id="scenario-input"
            rows={3}
            value={scenarioInput}
            onChange={(e) => setScenarioInput(e.target.value)}
            placeholder="e.g., select a scenario above, or describe your own..."
            className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-shadow"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="w-full flex justify-center items-center gap-2 bg-brand-accent text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-brand-accent-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating your look...' : 'Generate Outfit'}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <Loader />
          <p className="mt-4 text-gray-600 font-medium">Finding the perfect combination...</p>
        </div>
      )}

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>}

      {suggestedOutfit && (
        <div className="space-y-4">
          <OutfitCard outfit={suggestedOutfit} wardrobe={wardrobe}>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                  onClick={handleSaveSuggestion}
                  disabled={isCurrentOutfitSaved}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                  <BookmarkIcon className="w-5 h-5" />
                  {isCurrentOutfitSaved ? 'Outfit Saved' : 'Save Outfit'}
              </button>
              {avatar && (
                  <button
                  onClick={() => onTryOn(suggestedOutfit)}
                  className="w-full flex justify-center items-center gap-2 bg-fuchsia-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-fuchsia-700 transition-colors"
                  >
                  <AvatarIcon className="w-5 h-5" />
                  Try on Avatar
                  </button>
              )}
            </div>
          </OutfitCard>
        </div>
      )}

      {savedOutfits.length > 0 && (
          <div className="space-y-8 pt-8 mt-8 border-t-2 border-gray-200">
                <h3 className="text-2xl font-bold tracking-tight text-gray-900">Saved Outfits</h3>
                <div className="space-y-6">
                  {savedOutfits.map(outfit => (
                      <OutfitCard key={outfit.id} outfit={outfit} wardrobe={wardrobe} title={outfit.title}>
                          <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                  onClick={() => deleteSavedOutfit(outfit.id)}
                                  className="w-full flex justify-center items-center gap-2 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                              >
                                  <TrashIcon className="w-5 h-5" />
                                  Delete
                              </button>
                                {avatar && (
                                  <button
                                      onClick={() => onTryOn(outfit)}
                                      className="w-full flex justify-center items-center gap-2 bg-fuchsia-600 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-fuchsia-700 transition-colors"
                                  >
                                      <AvatarIcon className="w-5 h-5" />
                                      Try on Avatar
                                  </button>
                              )}
                          </div>
                      </OutfitCard>
                  ))}
                </div>
          </div>
      )}
    </div>
  );
};

export default StylistView;