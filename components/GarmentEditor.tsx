import React, { useState, useMemo } from 'react';
import type { Garment } from '../types';
import { XIcon } from './icons/XIcon';

interface GarmentEditorProps {
    garment: Garment;
    onSave: (garmentId: string, updatedData: Partial<Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>>) => void;
    onClose: () => void;
}

type EditableGarmentFields = Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>;

const GarmentEditor: React.FC<GarmentEditorProps> = ({ garment, onSave, onClose }) => {
    const [formData, setFormData] = useState<EditableGarmentFields>({
        category: garment.category,
        colors: garment.colors,
        season: garment.season,
        formality: garment.formality,
        description: garment.description,
    });
    
    const [colorsInput, setColorsInput] = useState(garment.colors.join(', '));

    const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        setColorsInput(input);
        const newColors = input.split(',').map(c => c.trim()).filter(c => /^#([0-9A-F]{3}){1,2}$/i.test(c));
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'formality' ? parseInt(value, 10) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            colors: colorsInput.split(',').map(c => c.trim()).filter(Boolean)
        };
        onSave(garment.id, finalData);
    };
    
    const colorSwatches = useMemo(() => {
      return colorsInput.split(',').map(c => c.trim()).filter(c => /^#([0-9A-F]{3}){1,2}$/i.test(c));
    }, [colorsInput]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl m-4 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Edit Garment</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600" aria-label="Close">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <form id="garment-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="sm:w-1/3 flex-shrink-0">
                            <img src={garment.imageData} alt={garment.description} className="w-full h-auto object-cover rounded-lg shadow-md aspect-square" />
                        </div>
                        <div className="sm:w-2/3 space-y-4">
                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                         <div>
                            <label htmlFor="season" className="block text-sm font-medium text-gray-700">Season</label>
                            <select name="season" id="season" value={formData.season} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm">
                                <option>Spring</option>
                                <option>Summer</option>
                                <option>Fall</option>
                                <option>Winter</option>
                                <option>All-Season</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="formality" className="block text-sm font-medium text-gray-700">Formality: {formData.formality}</label>
                            <input type="range" name="formality" id="formality" min="1" max="5" value={formData.formality} onChange={handleChange} className="mt-1 w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-accent" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="colors" className="block text-sm font-medium text-gray-700">Colors</label>
                        <input type="text" name="colors" id="colors" value={colorsInput} onChange={handleColorInputChange} placeholder="#ffffff, #000000, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm" />
                         <div className="flex items-center gap-2 mt-2 h-5">
                           {colorSwatches.map((color, index) => (
                              <span key={`${color}-${index}`} className="block w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: color }}></span>
                           ))}
                        </div>
                    </div>
                </form>

                <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
                        Cancel
                    </button>
                    <button type="submit" form="garment-editor-form" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GarmentEditor;