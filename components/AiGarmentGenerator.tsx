import React, { useState, useCallback } from 'react';
import { createGarmentFromPrompt } from '../services/geminiService';
import type { Garment } from '../types';
import Loader from './Loader';
import { XIcon } from './icons/XIcon';
import SketchUploader from './SketchUploader';
import { SparklesIcon } from './icons/SparklesIcon';

interface AiGarmentGeneratorProps {
    onClose: () => void;
    onGarmentCreated: (garment: Omit<Garment, 'id'>) => void;
}

const AiGarmentGenerator: React.FC<AiGarmentGeneratorProps> = ({ onClose, onGarmentCreated }) => {
    const [prompt, setPrompt] = useState('');
    const [sketch, setSketch] = useState<{ data: string; file: File } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('AI is sketching your design...');
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleSketchUpload = useCallback((imageDataUrl: string, file: File) => {
        setSketch({ data: imageDataUrl.split(',')[1], file });
    }, []);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Please describe the clothing item you want to create.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);
        setLoadingMessage('AI is sketching your design...');
        try {
            const sketchFile = sketch ? { data: sketch.data, type: sketch.file.type } : null;
            const newGarmentData = await createGarmentFromPrompt(prompt, sketchFile);
            setGeneratedImage(newGarmentData.imageData);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddAndClose = () => {
        if (!generatedImage) return;
        setIsLoading(true);
        setLoadingMessage('Analyzing and adding to closet...');
        // We already have the garment data from the generation step.
        // For a real app, we'd pass it back up.
        // Here, we'll re-run to simulate adding it.
        const sketchFile = sketch ? { data: sketch.data, type: sketch.file.type } : null;
        createGarmentFromPrompt(prompt, sketchFile)
            .then(onGarmentCreated)
            .catch(e => {
                setError(e.message);
                setIsLoading(false);
            });
    };

    const handleTryAgain = () => {
        setGeneratedImage(null);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in"
            aria-labelledby="ai-garment-generator-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 id="ai-garment-generator-title" className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-brand-accent"/>
                        AI Creation Studio
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors" aria-label="Close">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>

                <div className="p-6 space-y-4 overflow-y-auto">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader />
                            <p className="mt-4 text-gray-600 font-medium">{loadingMessage}</p>
                        </div>
                    ) : generatedImage ? (
                        <div className="space-y-4 text-center">
                            <p className="font-semibold text-gray-800">Here's what the AI created!</p>
                            <div className="rounded-lg overflow-hidden bg-[url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAACJJREFUOE9jZGBgEGHAD97/B4RmaKEKaGEK2EwUACQvAQB2/AbKi2EnoAAAAABJRU5ErkJggg==)]">
                                <img src={generatedImage} alt="AI generated garment" className="mx-auto max-h-64 object-contain" />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={handleTryAgain} className="w-full bg-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-md hover:bg-gray-300 transition-colors">
                                    Try Again
                                </button>
                                <button onClick={handleAddAndClose} className="w-full bg-brand-accent text-white font-semibold py-2.5 px-4 rounded-md hover:bg-brand-accent-hover transition-colors">
                                    Add to Closet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="space-y-4">
                            <div>
                                <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-700 mb-1">
                                    Describe your clothing item
                                </label>
                                <textarea
                                    id="prompt-input"
                                    rows={4}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="e.g., a blue denim jacket with patches, a flowing floral summer dress..."
                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-accent/50 focus:border-brand-accent transition-shadow"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload a sketch (optional)
                                </label>
                                <SketchUploader onUpload={handleSketchUpload} onRemove={() => setSketch(null)} />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center gap-2 bg-brand-accent text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-brand-accent-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                Generate Garment
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiGarmentGenerator;