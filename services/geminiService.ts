import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { Garment, Outfit } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const garmentSchema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "A specific category for the clothing item. Examples: T-Shirt, Jeans, Blazer, Sneakers, Dress, Sweatpants, Shorts, Skirt, Hoodie, Coat, Blouse. Be as specific as possible."
    },
    colors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of dominant color hex codes present in the item (e.g., ['#ffffff', '#000000'])."
    },
    season: {
      type: Type.STRING,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
      description: "The most appropriate season for this item."
    },
    formality: {
      type: Type.INTEGER,
      description: "A formality score from 1 (very casual) to 5 (very formal)."
    },
    description: {
      type: Type.STRING,
      description: "A brief, one-sentence description of the clothing item."
    }
  },
  required: ['category', 'colors', 'season', 'formality', 'description']
};

export const tagGarmentFromImage = async (imageData: string, mimeType: string): Promise<Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { data: imageData, mimeType } },
          { text: "Analyze this image of a single clothing item. Ignore the background and any people. Provide its characteristics as a JSON object." }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: garmentSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);
    
    // Basic validation
    if (parsed.formality < 1 || parsed.formality > 5) {
        parsed.formality = Math.max(1, Math.min(5, parsed.formality)) as Garment['formality'];
    }
    if (!['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'].includes(parsed.season)) {
        parsed.season = 'All-Season';
    }

    return parsed as Omit<Garment, 'id' | 'imageData' | 'cutoutImageData'>;

  } catch (error) {
    console.error("Error tagging garment with Gemini:", error);
    throw new Error("Could not analyze the clothing item. Please try another image.");
  }
};

export const getGarmentCutout = async (imageData: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    { inlineData: { data: imageData, mimeType } },
                    { text: 'Isolate the main clothing item in this image and place it on a transparent background. Do not add any text, shadows, or reflections. Return only the resulting image.' },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
        throw new Error("No image data found in the AI response.");
    } catch (error) {
        console.error("Error getting garment cutout:", error);
        throw new Error("Could not create a cutout for the clothing item.");
    }
};

export const processGarmentImage = async (imageData: string, mimeType: string): Promise<Omit<Garment, 'id' | 'imageData'>> => {
  const [tags, cutoutImageData] = await Promise.all([
    tagGarmentFromImage(imageData, mimeType),
    getGarmentCutout(imageData, mimeType),
  ]);

  return { ...tags, cutoutImageData };
};


const outfitSchema = {
    type: Type.OBJECT,
    properties: {
        outfitGarmentIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of garment IDs from the provided wardrobe that make up the complete outfit."
        },
        reasoning: {
            type: Type.STRING,
            description: "A short, encouraging explanation of why this outfit is a great choice for the specified occasion."
        }
    },
    required: ['outfitGarmentIds', 'reasoning']
};

export const getOutfitSuggestion = async (wardrobe: Garment[], scenario: string): Promise<Outfit> => {
    if (wardrobe.length === 0) {
        throw new Error("Wardrobe is empty. Cannot generate an outfit.");
    }

    const simplifiedWardrobe = wardrobe.map(g => ({
        id: g.id,
        category: g.category,
        description: g.description,
        colors: g.colors,
    }));

    const prompt = `You are a helpful and creative fashion stylist.
    My digital wardrobe contains the following items:
    ${JSON.stringify(simplifiedWardrobe, null, 2)}
    
    Please create a stylish and coherent outfit for this occasion: "${scenario}".
    
    Select items from my wardrobe to form a complete outfit (e.g., a top, a bottom, and shoes).
    Return your suggestion as a JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: outfitSchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Outfit;

    } catch (error) {
        console.error("Error getting outfit suggestion from Gemini:", error);
        throw new Error("Could not generate an outfit. You might need to add more items to your closet.");
    }
};

const generateGarmentImage = async (prompt: string, sketchData: string | null, mimeType: string | null): Promise<{ imageDataUrl: string; mimeType: string }> => {
    try {
        // Case 1: No sketch provided. Use text-to-image generation with Imagen.
        if (!sketchData || !mimeType) {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A photorealistic, front-facing image of a single clothing item: "${prompt}". The item must be on a completely transparent background. Do not include any text, shadows, or reflections.`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/png', // PNG supports transparency
                },
            });

            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return {
                    imageDataUrl: `data:image/png;base64,${base64ImageBytes}`,
                    mimeType: 'image/png',
                };
            }
            throw new Error("AI did not return an image. Try rephrasing your prompt.");
        }

        // Case 2: Sketch provided. Use image-to-image generation.
        const contentParts = [
            { inlineData: { data: sketchData, mimeType } },
            { text: `Based on this sketch, create a photorealistic image of the following clothing item: "${prompt}". The final image must be front-facing, on a completely transparent background, with no text, shadows, or reflections. Return only the image.` }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: contentParts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return {
                    imageDataUrl: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
                    mimeType: part.inlineData.mimeType,
                };
            }
        }
        throw new Error("AI did not return an image from the provided sketch. Try a different sketch or prompt.");

    } catch (error) {
        console.error("Error generating garment image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while generating the garment image.");
    }
};


export const createGarmentFromPrompt = async (prompt: string, sketchFile: {data: string, type: string} | null): Promise<Omit<Garment, 'id'>> => {
    const sketchDataBase64 = sketchFile ? sketchFile.data : null;
    const sketchMimeType = sketchFile ? sketchFile.type : null;

    // 1. Generate the image
    const { imageDataUrl, mimeType } = await generateGarmentImage(prompt, sketchDataBase64, sketchMimeType);
    
    const base64Data = imageDataUrl.split(',')[1];

    // 2. Tag the image
    const tags = await tagGarmentFromImage(base64Data, mimeType);

    // 3. Return the complete garment data object
    return {
        ...tags,
        imageData: imageDataUrl,
        cutoutImageData: imageDataUrl, // The generated image is already the cutout
    };
};