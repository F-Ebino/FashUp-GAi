import React, { useState, useCallback } from 'react';
import type { Garment, View, Avatar, Outfit, SavedOutfit } from './types';
import Header from './components/Header';
import ClosetView from './components/ClosetView';
import StylistView from './components/StylistView';
import AvatarView from './components/AvatarView';
import MirrorView from './components/MirrorView';

const App: React.FC = () => {
  const [view, setView] = useState<View>('closet');
  const [wardrobe, setWardrobe] = useState<Garment[]>([]);
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [mirrorOutfit, setMirrorOutfit] = useState<Outfit | null>(null);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addGarment = useCallback((newGarment: Garment) => {
    setWardrobe((prevWardrobe) => {
      // Avoid adding duplicates if the same image is processed again
      if (prevWardrobe.some(g => g.id === newGarment.id)) {
        return prevWardrobe;
      }
      return [newGarment, ...prevWardrobe];
    });
    setError(null);
  }, []);

  const deleteGarment = useCallback((garmentId: string) => {
    setWardrobe(prevWardrobe => prevWardrobe.filter(g => g.id !== garmentId));
  }, []);

  const updateGarment = useCallback((garmentId: string, updatedData: Partial<Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>>) => {
    setWardrobe(prev =>
      prev.map(g =>
        g.id === garmentId ? { ...g, ...updatedData } : g
      )
    );
    setError(null);
  }, []);

  const handleSetError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const handleSaveAvatar = useCallback((avatarData: Avatar) => {
    setAvatar(avatarData);
  }, []);

  const handleSaveOutfit = useCallback((outfitToSave: SavedOutfit) => {
    setSavedOutfits((prev) => {
      if (prev.some(o => o.id === outfitToSave.id)) {
        return prev;
      }
      return [outfitToSave, ...prev];
    });
  }, []);

  const handleDeleteSavedOutfit = useCallback((outfitId: string) => {
    setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
  }, []);

  const handleTryOnOutfit = useCallback((outfit: Outfit) => {
    setMirrorOutfit(outfit);
    setView('mirror');
  }, []);

  const handleClearMirrorOutfit = useCallback(() => {
    setMirrorOutfit(null);
  }, []);

  return (
    <div className="min-h-screen bg-brand-secondary font-sans text-brand-primary">
      <Header currentView={view} setView={setView} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert">
            <p className="font-bold">An error occurred</p>
            <p>{error}</p>
          </div>
        )}
        {view === 'closet' && <ClosetView wardrobe={wardrobe} addGarment={addGarment} deleteGarment={deleteGarment} updateGarment={updateGarment} setError={handleSetError} />}
        {view === 'stylist' && <StylistView wardrobe={wardrobe} avatar={avatar} onTryOn={handleTryOnOutfit} savedOutfits={savedOutfits} saveOutfit={handleSaveOutfit} deleteSavedOutfit={handleDeleteSavedOutfit} />}
        {view === 'mirror' && <MirrorView avatar={avatar} wardrobe={wardrobe} outfit={mirrorOutfit} addGarment={addGarment} onClearOutfit={handleClearMirrorOutfit} />}
        {view === 'avatar' && <AvatarView avatar={avatar} saveAvatar={handleSaveAvatar} wardrobe={wardrobe} />}
      </main>
    </div>
  );
};

export default App;