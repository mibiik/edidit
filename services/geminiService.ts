
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export type AiResponse = { type: 'image'; data: string } | { type: 'clarification'; message: string };

// Yeni tip: AI önerileri için
export type AiSuggestionResponse = { type: 'suggestions'; suggestions: string[] } | { type: 'error'; message: string };

const generateImage = async (prompt: string): Promise<AiResponse> => {
    try {
        // AI'ya sadece görsel üretmesini emret, hiçbir metin verme
        const enhancedPrompt = `Generate ONLY an image based on this description: "${prompt}". Do not provide any text response, explanation, or clarification. Just create the image.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: enhancedPrompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });

        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("Image generation failed, no images were returned.");
        }
        
        return { type: 'image', data: response.generatedImages[0].image.imageBytes };

    } catch (error) {
        console.error("Error generating image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred during image generation.");
    }
};

const editImage = async (prompt: string, imageData: string, mimeType: string): Promise<AiResponse> => {
    try {
        // AI'ya sadece görsel üretmesini emret, hiçbir metin verme
        const enhancedPrompt = `Edit this image based on this description: "${prompt}". Generate ONLY the edited image. Do not provide any text response, explanation, or clarification. Just return the modified image.`;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: enhancedPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE], // Sadece görsel, metin yok
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            let errorMessage = "Image editing failed. The model did not return a result.";
            if (response.promptFeedback?.blockReason) {
                errorMessage = `Your request was blocked. Reason: ${response.promptFeedback.blockReason}. Please modify your prompt.`;
            } else {
                errorMessage += " This can happen if the request is unclear or violates safety policies. Please try rephrasing your prompt.";
            }
            throw new Error(errorMessage);
        }
        
        const imagePart = response.candidates[0].content?.parts.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return { type: 'image', data: imagePart.inlineData.data };
        }
        
        throw new Error("The model did not return an image. Please try rephrasing your prompt.");

    } catch (error) {
        console.error("Error editing image:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred during image editing.");
    }
};

export const generateOrEditImage = async (
  prompt: string,
  image?: { data: string; mimeType: string }
): Promise<AiResponse> => {
  if (image && image.data && image.mimeType) {
    return editImage(prompt, image.data, image.mimeType);
  } else {
    return generateImage(prompt);
  }
};

// Fotoğraf analizi ve öneri alma fonksiyonu
export const analyzeImageAndGetSuggestions = async (imageData: string, mimeType: string): Promise<AiSuggestionResponse> => {
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: imageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Bu fotoğrafı analiz et ve Türkçe olarak 8-10 tane yaratıcı düzenleme önerisi ver. Öneriler kısa ve net olsun. Sadece öneri listesini döndür, başka açıklama yapma. Her öneri yeni satırda olsun.`,
                    },
                ],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            throw new Error("AI analizi başarısız oldu. Lütfen tekrar deneyin.");
        }
        
        const textPart = response.candidates[0].content?.parts.find(part => part.text);
        if (textPart && textPart.text) {
            // Metni satırlara böl ve temizle
            const suggestions = textPart.text
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.startsWith('-') && !line.startsWith('•'))
                .slice(0, 10); // Maksimum 10 öneri
            
            return { type: 'suggestions', suggestions };
        }
        
        throw new Error("AI'dan öneri alınamadı. Lütfen tekrar deneyin.");

    } catch (error) {
        console.error("Fotoğraf analizi hatası:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Fotoğraf analizi sırasında bilinmeyen bir hata oluştu.");
    }
};
