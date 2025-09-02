import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Upload, Link, Mic, Send, X, Download, Camera, Image as ImageIcon, RefreshCw, Plus, Wand2, Palette, Sparkles as SparklesIcon } from 'lucide-react';

// Gemini API servisi - gerçek resim üretimi için
import { generateOrEditImage, analyzeImageAndGetSuggestions } from './services/geminiService';

type Option = 'scratch';

type ResultItem = { id: number; prompt: string; image?: string; status: 'pending' | 'done' | 'error' | 'clarification'; message?: string };

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'tr' | 'de' | 'fr' | 'es'>('en');
  const [activeTab, setActiveTab] = useState<'studio' | 'discover'>('studio');
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [isFirstPromptSubmitted, setIsFirstPromptSubmitted] = useState<boolean>(false);
  
  // Her resmin düzenleme geçmişini takip etmek için
  const [editHistory, setEditHistory] = useState<Record<number, string[]>>({});
  
  // AI önerileri için
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [suggestionCategories, setSuggestionCategories] = useState<string[]>([]);
  const [selectedSuggestionCategory, setSelectedSuggestionCategory] = useState<string>('all');
  
  // Fotoğraf analizi için yeni state'ler
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisSuggestions, setImageAnalysisSuggestions] = useState<string[]>([]);

  // selected state'i artık kullanılmadığı için kaldırılabilir, ama bir zararı yok.
  const [selected, setSelected] = useState<'scratch'>('scratch');

  // Sayfa açıldığında otomatik öneriler üret
  useEffect(() => {
    generateAISuggestions();
  }, []);

  // Yapay zeka ile farklı öneriler üret
  const generateAISuggestions = async () => {
    try {
      // Farklı kategorilerden rastgele öneriler
      const allSuggestions = [
        // Sürrealist ve Fantastik
        'Sürrealist bir dünyada kaybolmuş bir karakter',
        'Neon ışıklarla aydınlatılmış cyberpunk sokak',
        'Zaman yolculuğu yapan bir makine',
        'Paralel evrende var olan alternatif gerçeklik',
        'Hologram teknolojisi ile oluşturulmuş sanat eseri',
        'Glitch art stilde bozulmuş dijital dünya',
        'Su altı şehri ve deniz canlıları',
        'Uzay istasyonunda yaşayan astronotlar',
        'Rüya görünümünde mistik yaratıklar',
        'Sihirli orman ve büyülü yaratıklar',
        
        // Sanat Stilleri
        'Van Gogh tarzında yıldızlı gece',
        'Picasso stilde kübist portre',
        'Salvador Dali tarzında sürrealist sahne',
        'Monet stilde impressionist manzara',
        'Frida Kahlo tarzında otoportre',
        'Andy Warhol stilde pop art',
        'Banksy tarzında street art',
        'Hokusai stilde Japon manzara',
        
        // Teknoloji ve Gelecek
        'Robot ve insan birlikte yaşayan şehir',
        'Sanal gerçeklik içinde kaybolmuş karakter',
        'Yapay zeka tarafından yönetilen dünya',
        'Kuantum fiziği görselleştirmesi',
        'Nanoteknoloji ile oluşturulmuş yapılar',
        'Biyonik insan ve organik teknoloji',
        'Uzay gemisi içinde yaşam',
        'Mars kolonisi ve kızıl gezegen',
        
        // Doğa ve Çevre
        'İklim değişikliği sonrası dünya',
        'Yeniden doğan orman ve vahşi yaşam',
        'Okyanus derinliklerinde gizli şehir',
        'Volkanik patlama ve lav akışı',
        'Kutup ışıkları altında dans eden kutup ayısı',
        'Çöl vahasında gizli bahçe',
        'Tropik orman ve egzotik kuşlar',
        'Dağ zirvesinde bulutlar arasında kale',
        
        // Kültür ve Tarih
        'Antik Mısır piramitleri ve firavun',
        'Roma İmparatorluğu gladyatör dövüşü',
        'Viking gemisi ve deniz savaşı',
        'Ortaçağ şatosu ve şövalyeler',
        'Rönesans dönemi sanat atölyesi',
        'Osmanlı sarayı ve sultan',
        'Çin imparatorluk bahçesi',
        'Maya piramitleri ve astronomi',
        
        // Modern Yaşam
        'Büyük şehirde kaybolmuş insan',
        'Metro istasyonunda bekleyen kalabalık',
        'Gökdelenler arasında uçan kuşlar',
        'Cafede kitap okuyan insanlar',
        'Parkta piknik yapan aile',
        'Sokak müzisyeni ve dinleyiciler',
        'Gece kulübünde dans eden insanlar',
        'Sahilde gün batımı izleyen çift'
      ];
      
      // Rastgele 12 farklı öneri seç
      const shuffled = allSuggestions.sort(() => 0.5 - Math.random());
      const selectedSuggestions = shuffled.slice(0, 12);
      
      setAiSuggestions(selectedSuggestions);
      
    } catch (error) {
      console.error('Öneri üretme hatası:', error);
      // Hata durumunda varsayılan önerileri göster
      const fallbackSuggestions = [
        'Sürrealist bir dünyada kaybolmuş bir karakter',
        'Neon ışıklarla aydınlatılmış cyberpunk sokak',
        'Zaman yolculuğu yapan bir makine',
        'Paralel evrende var olan alternatif gerçeklik',
        'Hologram teknolojisi ile oluşturulmuş sanat eseri',
        'Glitch art stilde bozulmuş dijital dünya',
        'Su altı şehri ve deniz canlıları',
        'Uzay istasyonunda yaşayan astronotlar'
      ];
      setAiSuggestions(fallbackSuggestions);
    }
  };

  // Fotoğraf yüklendiğinde AI analizi yap
  const analyzeUploadedImage = async (imageData: string, mimeType: string) => {
    setIsAnalyzingImage(true);
    try {
      const response = await analyzeImageAndGetSuggestions(imageData, mimeType);
      if (response.type === 'suggestions') {
        setImageAnalysisSuggestions(response.suggestions);
        // AI önerilerini de güncelle
        setAiSuggestions(response.suggestions);
      } else {
        console.error('AI analizi hatası:', response.message);
        // Hata durumunda basit önerileri göster
        const fallbackSuggestions = [
          'Renkleri daha canlı yap',
          'Vintage efekt ekle',
          'Siyah-beyaz yap',
          'Arka planı bulanıklaştır',
          'Daha parlak yap',
          'Kontrast arttır'
        ];
        setImageAnalysisSuggestions(fallbackSuggestions);
        setAiSuggestions(fallbackSuggestions);
      }
    } catch (error) {
      console.error('Fotoğraf analizi hatası:', error);
      // Hata durumunda basit önerileri göster
      const fallbackSuggestions = [
        'Renkleri daha canlı yap',
        'Vintage efekt ekle',
        'Siyah-beyaz yap',
        'Arka planı bulanıklaştır',
        'Daha parlak yap',
        'Kontrast arttır'
      ];
      setImageAnalysisSuggestions(fallbackSuggestions);
      setAiSuggestions(fallbackSuggestions);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scratchInputRef = useRef<HTMLInputElement>(null);

  const baseButton = 'px-7 py-3 rounded-full text-base font-semibold transition-colors relative z-10';
  const selectedClass = 'bg-[#6750A4] text-white';
  const unselectedClass = 'bg-white text-[#6750A4]';

  // Translations
  const translations = {
    en: {
      scratch: 'scratch',
      makeYourDreamReal: 'make your dream real',
      addMedia: 'Add Media',
      addMediaFromUrl: 'Add Media from URL',
      mediaAdded: 'Media Added',
      removeMedia: 'Remove Media',
      download: 'Download',
      generating: 'Generating...',
      outputWillAppearHere: 'Output will appear here',
      prompt: 'Prompt',
      uploadImage: 'Upload an image or paste from clipboard',
      selectFile: 'Select File',
      paste: 'Paste',
      editImagePrompt: 'How to edit this image?',
      send: 'Send',
      stopVoice: 'Stop Voice',
      startVoice: 'Start Voice'
    },
    tr: {
      scratch: 'sıfırdan',
      makeYourDreamReal: 'hayalini gerçekleştir',
      addMedia: 'Medya Ekle',
      addMediaFromUrl: 'URL\'den Medya Ekle',
      mediaAdded: 'Medya Eklendi',
      removeMedia: 'Medyayı Kaldır',
      download: 'İndir',
      generating: 'Üretiliyor...',
      outputWillAppearHere: 'Çıktı burada görünecek',
      prompt: 'Prompt',
      uploadImage: 'Bir görsel yükleyin ya da panoya yapıştırın',
      selectFile: 'Dosya Seç',
      paste: 'Yapıştır',
      editImagePrompt: 'Bu görseli nasıl düzenleyelim?',
      send: 'Gönder',
      stopVoice: 'Sesi Durdur',
      startVoice: 'Sesi Başlat'
    },
    de: {
      scratch: 'von Grund auf',
      makeYourDreamReal: 'verwirkliche deinen Traum',
      addMedia: 'Medien hinzufügen',
      addMediaFromUrl: 'Medien von URL hinzufügen',
      mediaAdded: 'Medien hinzugefügt',
      removeMedia: 'Medien entfernen',
      download: 'Herunterladen',
      generating: 'Generiere...',
      outputWillAppearHere: 'Ausgabe wird hier angezeigt',
      prompt: 'Prompt',
      uploadImage: 'Laden Sie ein Bild hoch oder fügen Sie es aus der Zwischenablage ein',
      selectFile: 'Datei auswählen',
      paste: 'Einfügen',
      editImagePrompt: 'Wie bearbeiten wir dieses Bild?',
      send: 'Senden',
      stopVoice: 'Stimme stoppen',
      startVoice: 'Stimme starten'
    },
    fr: {
      scratch: 'à partir de zéro',
      makeYourDreamReal: 'réalisez votre rêve',
      addMedia: 'Ajouter des médias',
      addMediaFromUrl: 'Ajouter des médias depuis l\'URL',
      mediaAdded: 'Médias ajoutés',
      removeMedia: 'Supprimer les médias',
      download: 'Télécharger',
      generating: 'Génération...',
      outputWillAppearHere: 'La sortie apparaîtra ici',
      prompt: 'Prompt',
      uploadImage: 'Téléchargez une image ou collez depuis le presse-papiers',
      selectFile: 'Sélectionner un fichier',
      paste: 'Coller',
      editImagePrompt: 'Comment modifier cette image?',
      send: 'Envoyer',
      stopVoice: 'Arrêter la voix',
      startVoice: 'Démarrer la voix'
    },
    es: {
      scratch: 'desde cero',
      makeYourDreamReal: 'haz realidad tu sueño',
      addMedia: 'Agregar medios',
      addMediaFromUrl: 'Agregar medios desde URL',
      mediaAdded: 'Medios agregados',
      removeMedia: 'Eliminar medios',
      download: 'Descargar',
      generating: 'Generando...',
      outputWillAppearHere: 'La salida aparecerá aquí',
      prompt: 'Prompt',
      uploadImage: 'Sube una imagen o pega desde el portapapeles',
      selectFile: 'Seleccionar archivo',
      paste: 'Pegar',
      editImagePrompt: '¿Cómo editamos esta imagen?',
      send: 'Enviar',
      stopVoice: 'Detener voz',
      startVoice: 'Iniciar voz'
    }
  };

  const t = translations[language];

  // Yerel öneriler üret - API çağrısı yok
  // Eski generateAdvancedSuggestions fonksiyonu kaldırıldı - artık AI tabanlı sistem kullanılıyor

  const runPrompt = useCallback(async (text: string, shouldScroll: boolean = true) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    setIsLoading(true);

    const id = Date.now();
    setResults((prev) => [...prev, { id, prompt: trimmed, status: 'pending' }]);

    // Düzenleme başladığında hemen sayfa en alta scroll yap
    if (shouldScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }

    try {
      // Seçilen resim varsa, onu AI servisine gönder
      let imageData: { data: string; mimeType: string } | undefined;
      
      if (selectedImage) {
        // Data URL'den base64 verisini çıkar
        const base64Data = selectedImage.split(',')[1];
        const mimeType = selectedImage.split(':')[1].split(';')[0];
        imageData = { data: base64Data, mimeType };
      }

      const res = await generateOrEditImage(trimmed, imageData);
      if (res.type === 'image') {
        const newImage = `data:image/png;base64,${res.data}`;
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'done', image: newImage } : r)));
        
        // Eğer bu bir düzenleme işlemi ise (selectedImage varsa), selectedImage'i güncelle
        if (selectedImage) {
          setSelectedImage(newImage);
        }
        
        // Yeni resim için düzenleme geçmişi başlat
        setEditHistory(prev => ({
          ...prev,
          [id]: []
        }));
        
        // Yeni sonuç üretildikten sonra sayfa en alta scroll yap
        if (shouldScroll) {
          setTimeout(() => {
            window.scrollTo({
              top: document.documentElement.scrollHeight,
              behavior: 'smooth'
            });
          }, 100);
        }
      } else {
        setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'error', message: 'Image generation failed. Please try again.' } : r)));
      }
    } catch (e: any) {
      const msg = e?.message || 'Bir hata oluştu.';
      setResults((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'error', message: msg } : r)));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedImage]);

  const handleSubmit = async () => {
    if (!isFirstPromptSubmitted) {
      setIsFirstPromptSubmitted(true);
    }
    await runPrompt(prompt, true); // Ana input'ta da scroll yap
  };

  const handleImageSelect = (imageData: string) => {
    setSelectedImage(imageData);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    // AI analizi sonuçlarını da temizle
    setImageAnalysisSuggestions([]);
    setAiSuggestions([]);
    // Varsayılan önerileri tekrar göster
    generateAISuggestions();
  };

  // ESC tuşuna basıldığında tam ekran modal'ı kapat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenImage) {
        setFullscreenImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenImage]);
  
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type.startsWith('image/')) {
      try {
        const dataUrl = await fileToDataUrl(file);
        handleImageSelect(dataUrl);
        
        // Fotoğraf yüklendiğinde AI analizi yap
        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.split(':')[1].split(';')[0];
        await analyzeUploadedImage(base64Data, mimeType);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const fetchImageFromUrl = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Görsel yüklenemedi');
      
      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) throw new Error('Geçerli bir görsel değil');
      
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      
              handleImageSelect(dataUrl);
        
        // URL'den yüklenen görsel için de AI analizi yap
        const base64Data = dataUrl.split(',')[1];
        const mimeType = dataUrl.split(':')[1].split(';')[0];
        await analyzeUploadedImage(base64Data, mimeType);
    } catch (error) {
      console.error('URL\'den görsel yükleme hatası:', error);
      alert('Görsel yüklenemedi. Lütfen geçerli bir URL girin.');
    }
  };

  const toggleListening = () => {
    const SpeechRecognition: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition is not supported in this browser.');
      return;
    }
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript ?? '';
        if (transcript) {
          setPrompt((prev) => (prev ? prev + ' ' : '') + transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      setIsListening(true);
      recognitionRef.current = recognition;
    }
  };

  const ImageUploadButton = () => (
    <button
      onClick={() => fileInputRef.current?.click()}
      className="p-2 rounded-full bg-[#6750A4]/10 text-[#6750A4] hover:bg-[#6750A4]/20 transition-colors"
      title="Görsel ekle"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>
  );

  const SelectedImagePreview = ({ image, onRemove }: { image: string; onRemove: () => void }) => (
    <div className="relative inline-block">
      <img src={image} alt="Seçilen görsel" className="w-8 h-8 rounded-lg object-cover" />
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
        title="Görseli kaldır"
      >
        ×
      </button>
    </div>
  );

  // Tam ekran görsel modal bileşeni
  const FullscreenImageModal = ({ image, onClose }: { image: string; onClose: () => void }) => (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <img 
          src={image} 
          alt="Tam ekran görsel" 
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 text-white rounded-full flex items-center justify-center hover:bg-white/30 transition-colors backdrop-blur"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-2 rounded-lg text-sm backdrop-blur">
          ESC tuşuna basarak da kapatabilirsiniz
        </div>
      </div>
    </div>
  );

  const FollowUpInput: React.FC<{ onSubmit: (value: string) => void; placeholder?: string; referenceImageId?: number }> = ({ onSubmit, placeholder, referenceImageId }) => {
    const [value, setValue] = useState('');
    const [localSuggestions, setLocalSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    // Bu input için resim durumuna göre öneriler üret
    const generateLocalSuggestions = useCallback((currentValue: string) => {
      if (!currentValue.trim() || currentValue.length < 2) {
        setLocalSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      // Eski öneri sistemi kaldırıldı - artık AI tabanlı sistem kullanılıyor
      // Bu fonksiyon artık kullanılmıyor
      setLocalSuggestions([]);
      setShowSuggestions(false);
    }, [selectedImage]);

    const handleSubmitFollowUp = () => {
      if (value.trim()) {
        onSubmit(value.trim());
        setValue('');
        setShowSuggestions(false);
        // Input'ta focus'u koru
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault(); // Form submit olmasını engelle
        handleSubmitFollowUp();
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      } else if (e.key === 'Tab') {
        // Tab tuşuna basıldığında önerileri göster
        e.preventDefault();
        if (value.length >= 2) {
          generateLocalSuggestions(value);
        }
      }
    };

    const handleSuggestionClick = (suggestion: string) => {
      setValue(suggestion);
      setShowSuggestions(false);
      inputRef.current?.focus();
    };

    return (
      <div className="relative">
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitFollowUp(); }} className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                const newValue = e.target.value;
                setValue(newValue);
                // Önerileri sadece Enter tuşuna basıldığında göster
                if (newValue.length === 0) {
                  setShowSuggestions(false);
                }
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                // Focus'ta öneri gösterme
              }}
              onBlur={() => {
                // Blur'da öneri gösterme
              }}
              placeholder={placeholder || (selectedImage ? "Bu resmi nasıl düzenleyelim?" : "Yeni bir görsel oluşturalım?")}
              className="w-full bg-white border border-black/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
            />
            
            {/* Hızlı öneriler */}
            {showSuggestions && localSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                {localSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-[#6750A4]/10 hover:text-[#6750A4] transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#6750A4] rounded-full"></div>
                      {suggestion}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!value.trim()}
            className="px-4 py-2 bg-[#6750A4] text-white rounded-full text-sm font-medium hover:bg-[#4b3c7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {placeholder ? "Düzenle" : "Gönder"}
          </button>
        </form>
      </div>
    );
  };

  const ScratchPanel = () => {
    useEffect(() => {
      if (scratchInputRef.current) {
        scratchInputRef.current.focus();
      }
      // Sayfa yüklendiğinde önerileri gösterme - sadece manuel olarak
    }, []);

    const handleScratchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    return (
      <section className="w-full max-w-7xl -mt-8">
        <div className="bg-white/95 backdrop-blur rounded-[28px] sm:rounded-[32px] md:rounded-[40px] min-h-[420px] sm:min-h-[480px] md:min-h-[520px] p-4 sm:p-6 md:p-10 flex items-center justify-center shadow-xl ring-1 ring-black/5 w-full">
                      <div className="w-full max-w-5xl flex flex-col gap-6">
              {/* Seçilen resim göstergesi */}
              {selectedImage && (
                <div className="bg-[#6750A4]/10 border border-[#6750A4]/20 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <img 
                      src={selectedImage} 
                      alt="Referans resim" 
                      className="w-full h-full object-cover"
                      onClick={() => setFullscreenImage(selectedImage)}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[#6750A4] font-medium text-sm">Referans resim seçildi</p>
                    <p className="text-[#6750A4]/70 text-xs">AI bu resmi referans alarak yeni görsel üretecek</p>
                  </div>
                  <button
                    onClick={removeSelectedImage}
                    className="p-2 rounded-full bg-[#6750A4]/20 text-[#6750A4] hover:bg-[#6750A4]/30 transition-colors"
                    title="Referans resmi kaldır"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              

              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-gradient-to-r from-white via-white to-[#6750A4]/5 border-2 border-[#6750A4]/20 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl sm:rounded-full pl-4 sm:pl-6 md:pl-8 pr-3 sm:pr-2 md:pr-3 py-3 sm:py-4 md:py-5 focus-within:ring-4 focus-within:ring-[#6750A4]/30 focus-within:shadow-3xl focus-within:scale-105 backdrop-blur-sm">
              <div className="flex items-center flex-1 min-w-0">
                <span className="text-[#6750A4] select-none text-2xl sm:text-3xl md:text-4xl mr-3 sm:mr-4 md:mr-5 animate-pulse">✦</span>
                {isFirstPromptSubmitted ? (
                  <div className="flex-1 flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">İlk prompt gönderildi</span>
                  </div>
                ) : (
                  <div className="relative flex-1">
                    <input
                      ref={scratchInputRef}
                      value={prompt}
                                          onChange={(e) => {
                      const newValue = e.target.value;
                      setPrompt(newValue);
                    }}
                      onKeyDown={handleScratchInputKeyDown}

                      placeholder={selectedImage ? "Bu resmi nasıl düzenleyelim?" : t.makeYourDreamReal}
                      className="w-full bg-transparent outline-none text-base sm:text-lg md:text-xl placeholder-gray-500 min-w-0 resize-none font-medium"
                      style={{ minHeight: '32px', maxHeight: '140px', height: 'auto', overflowY: 'hidden' }}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                      }}
                    />
                    

                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3 mt-3 sm:mt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-[#6750A4]/20 pt-3 sm:pt-0">
                {isFirstPromptSubmitted && (
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-[#6750A4] to-[#4b3c7a] text-white rounded-full text-base font-semibold hover:from-[#4b3c7a] hover:to-[#6750A4] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Yeni
                  </button>
                )}
                <ImageUploadButton />
                {selectedImage && <SelectedImagePreview image={selectedImage} onRemove={removeSelectedImage} />}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                <button
                  onClick={() => {
                    const url = window.prompt("Görsel URL'sini yapıştırın:");
                    if (url && url.trim()) {
                      fetchImageFromUrl(url.trim());
                    }
                  }}
                  className="p-2 rounded-full bg-[#6750A4]/10 text-[#6750A4] hover:bg-[#6750A4]/20 transition-colors"
                  title="URL'den görsel ekle"
                >
                  <Link className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleListening}
                  className={`p-1.5 sm:p-2 rounded-full transition-colors ${isListening ? 'bg-[#6750A4]/15 text-[#6750A4]' : 'text-[#6750A4] hover:bg-[#6750A4]/10'}`}
                  aria-label={isListening ? 'stop voice input' : 'start voice input'}
                  title={isListening ? 'Dinlemeyi durdur' : 'Sese başla'}
                >
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                  className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center transition-all duration-300 ${prompt.trim() && !isLoading ? 'bg-gradient-to-r from-[#6750A4] to-[#4b3c7a] text-white hover:from-[#4b3c7a] hover:to-[#6750A4] shadow-lg hover:shadow-xl transform hover:scale-110' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  aria-label="send"
                  title="Send (Enter)"
                >
                  <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
                        </div>
            
            {/* Input alanının altında film şeridi gibi akan öneriler */}
            <div className="mt-4 bg-gradient-to-r from-white/80 to-[#6750A4]/5 backdrop-blur-sm border border-[#6750A4]/20 rounded-xl p-3 shadow-sm overflow-hidden">
              {/* Film şeridi gibi akan öneriler */}
              <div className="relative">
                {isAnalyzingImage ? (
                  /* Fotoğraf analiz edilirken loading mesajı */
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded-full border-2 border-[#6750A4]/30 border-t-[#6750A4] animate-spin"></div>
                      <span className="text-[#6750A4] text-sm font-medium">Düzenleme önerileri yükleniyor...</span>
                    </div>
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  /* Öneriler yüklendiğinde film şeridi */
                  <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                    {aiSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setPrompt(suggestion);
                        }}
                        className="flex-shrink-0 px-4 py-2.5 bg-gradient-to-r from-white/80 to-[#6750A4]/10 hover:from-white hover:to-[#6750A4]/20 text-[#6750A4] text-xs rounded-full border border-[#6750A4]/20 transition-all duration-300 hover:scale-110 hover:shadow-lg text-left group min-w-max"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#6750A4] rounded-full group-hover:scale-150 transition-transform duration-300"></div>
                          <span className="font-medium whitespace-nowrap">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                    
                    {/* Yenile butonu önerilerin yanında */}
                    <button
                      onClick={() => generateAISuggestions()}
                      className="flex-shrink-0 p-2 bg-gradient-to-r from-white/80 to-[#6750A4]/10 hover:from-white hover:to-[#6750A4]/20 text-[#6750A4] rounded-full border border-[#6750A4]/20 transition-all duration-300 hover:scale-110 hover:shadow-lg"
                      title="Yeni öneriler al"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  /* Hiç öneri yokken boş durum */
                  <div className="flex items-center justify-center py-4">
                    <span className="text-[#6750A4]/60 text-sm">Öneriler burada görünecek</span>
                  </div>
                )}
                
                {/* Sol gradient overlay */}
                <div className="absolute left-0 top-0 bottom-1 w-6 bg-gradient-to-r from-white/80 to-transparent pointer-events-none"></div>
                
                {/* Sağ gradient overlay */}
                <div className="absolute right-0 top-0 bottom-1 w-6 bg-gradient-to-l from-white/80 to-transparent pointer-events-none"></div>
              </div>
            </div>
            
            {/* Ana prompt input'unun altında yeni görsel oluşturma input'u */}
            <div className="w-full flex flex-col gap-8">
              {results.length === 0 && isFirstPromptSubmitted && (
                <FollowUpInput 
                  onSubmit={async (prompt) => {
                    // Yeni görsel oluştur (resim referansı olmadan)
                    const trimmed = prompt.trim();
                    if (!trimmed) return;
                    
                    // Yeni bir sonuç ekle
                    const newId = Date.now();
                    setResults((prev) => [...prev, { id: newId, prompt: trimmed, status: 'pending' }]);
                    
                    // Düzenleme başladığında hemen sayfa en alta scroll yap
                    setTimeout(() => {
                      window.scrollTo({
                        top: document.documentElement.scrollHeight,
                        behavior: 'smooth'
                      });
                    }, 100);
                    
                    try {
                      // AI servisini resim olmadan çağır
                      const res = await generateOrEditImage(trimmed);
                      if (res.type === 'image') {
                        const newImage = `data:image/png;base64,${res.data}`;
                        setResults((prev) => prev.map((result) => 
                          result.id === newId ? { ...result, status: 'done', image: newImage } : result
                        ));
                        
                        // Yeni sonuç üretildikten sonra sayfa en alta scroll yap
                        setTimeout(() => {
                          window.scrollTo({
                            top: document.documentElement.scrollHeight,
                            behavior: 'smooth'
                          });
                        }, 100);
                        
                        // Yeni resim için boş düzenleme geçmişi başlat
                        setEditHistory(prev => ({
                          ...prev,
                          [newId]: []
                        }));
                      } else {
                        setResults((prev) => prev.map((result) => 
                          result.id === newId ? { ...result, status: 'error', message: 'Image generation failed.' } : result
                        ));
                      }
                    } catch (e: any) {
                      const msg = e?.message || 'Bir hata oluştu.';
                      setResults((prev) => prev.map((result) => 
                        result.id === newId ? { ...result, status: 'error', message: msg } : result
                      ));
                    }
                  }}
                  placeholder="Yeni bir görsel oluşturalım?"
                />
              )}
              {results.length === 0 && (
                <div className="w-full min-h-[260px] sm:min-h-[320px] rounded-3xl bg-white/60 flex items-center justify-center overflow-hidden ring-1 ring-black/5">
                                     <p className="text-gray-500 text-sm sm:text-base">{t.outputWillAppearHere}</p>
                </div>
              )}

              {results.map((r) => (
                <div key={r.id} data-result-id={r.id} className="w-full rounded-3xl bg-white/60 ring-1 ring-black/5 overflow-hidden">
                  <div className="p-4 sm:p-6 flex flex-col gap-4">
                    <div className="text-sm text-gray-600">{t.prompt}: <span className="text-gray-800">{r.prompt}</span></div>
                    <div className="w-full flex items-center justify-end">
                        {r.status === 'done' && (
                          <a
                            href={r.image}
                            download={`result-${r.id}.png`}
                            className="px-3 py-2 rounded-full bg-white text-[#6750A4] shadow hover:shadow-md transition ring-1 ring-black/10 text-sm font-medium"
                          >
                             {t.download}
                           </a>
                        )}
                    </div>
                    <div className="w-full min-h-[220px] sm:min-h-[280px] flex items-center justify-center">
                      {r.status === 'pending' && (
                        <div className="flex flex-col items-center gap-3 text-[#6750A4]">
                          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-[#6750A4]/30 border-t-[#6750A4] animate-spin"></div>
                          <p className="font-medium text-sm sm:text-base">{t.generating}</p>
                        </div>
                      )}
                      {r.status === 'done' && r.image && (
                        <img 
                          src={r.image} 
                          alt="AI output" 
                          className="max-h-[420px] w-auto object-contain self-center cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setFullscreenImage(r.image!)}
                        />
                      )}
                      {r.status === 'clarification' && (
                        <p className="text-[#6750A4] px-6 text-center text-sm sm:text-base">{r.message}</p>
                      )}
                      {r.status === 'error' && (
                        <p className="text-red-600 px-6 text-center text-sm sm:text-base">{r.message}</p>
                      )}
                    </div>
                    
                    {/* Her resmin altında kendi düzenleme input'u */}
                    {r.status === 'done' && r.image && (
                      <FollowUpInput 
                          onSubmit={async (prompt) => {
                            // Bu resmi doğrudan AI servisine gönder
                            const trimmed = prompt.trim();
                            if (!trimmed) return;
                            
                            // Yeni bir sonuç ekle
                            const editId = Date.now();
                            setResults((prev) => [...prev, { id: editId, prompt: trimmed, status: 'pending' }]);
                            
                            // Düzenleme başladığında hemen sayfa en alta scroll yap
                            setTimeout(() => {
                              window.scrollTo({
                                top: document.documentElement.scrollHeight,
                                behavior: 'smooth'
                              });
                            }, 100);
                            
                            try {
                              // Resmi base64 formatına çevir
                              const base64Data = r.image!.split(',')[1];
                              const mimeType = r.image!.split(':')[1].split(';')[0];
                              const imageData = { data: base64Data, mimeType };
                              
                              // Düzenleme geçmişini al ve birleştir - önceki resmin geçmişini devral
                              const history = editHistory[r.id] || [];
                              const fullPrompt = history.length > 0 
                                ? `Önceki düzenlemeler: ${history.join(', ')}. Şimdi: ${trimmed}`
                                : trimmed;
                              
                              // AI servisini çağır
                              const res = await generateOrEditImage(fullPrompt, imageData);
                              if (res.type === 'image') {
                                const newImage = `data:image/png;base64,${res.data}`;
                                setResults((prev) => prev.map((result) => 
                                  result.id === editId ? { ...result, status: 'done', image: newImage } : result
                                ));
                                
                                // Düzenleme geçmişini güncelle - yeni resim için önceki resmin geçmişini devral
                                setEditHistory(prev => ({
                                  ...prev,
                                  [editId]: [...(prev[r.id] || []), trimmed] // Yeni resim önceki resmin geçmişini devralır
                                }));
                                
                                // Yeni sonuç üretildikten sonra sayfa en alta scroll yap
                                setTimeout(() => {
                                  window.scrollTo({
                                    top: document.documentElement.scrollHeight,
                                    behavior: 'smooth'
                                  });
                                }, 100);
                              } else {
                                setResults((prev) => prev.map((result) => 
                                  result.id === editId ? { ...result, status: 'error', message: 'Image editing failed.' } : result
                                ));
                              }
                            } catch (e: any) {
                              const msg = e?.message || 'Bir hata oluştu.';
                              setResults((prev) => prev.map((result) => 
                                result.id === editId ? { ...result, status: 'error', message: msg } : result
                              ));
                            }
                          }}
                          referenceImageId={r.id}
                          placeholder="Bu resmi nasıl düzenleyelim?"
                        />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };

  // *** SORUNLU OLAN BÜYÜK VE FAZLALIK JSX BLOĞU BURADAN KALDIRILDI ***

  return (
    <div className="bg-[#D0BCFF] min-h-screen font-sans">
      <main className="container mx-auto min-h-screen flex flex-col items-center pt-24 p-6 gap-12 pb-32">
        <div className="flex gap-2 items-center">
          <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'en' ? 'bg-[#6750A4] text-white' : 'bg-white/80 text-[#6750A4] hover:bg-white'}`}>EN</button>
          <button onClick={() => setLanguage('tr')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'tr' ? 'bg-[#6750A4] text-white' : 'bg-white/80 text-[#6750A4] hover:bg-white'}`}>TR</button>
          <button onClick={() => setLanguage('de')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'de' ? 'bg-[#6750A4] text-white' : 'bg-white/80 text-[#6750A4] hover:bg-white'}`}>DE</button>
          <button onClick={() => setLanguage('fr')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'fr' ? 'bg-[#6750A4] text-white' : 'bg-white/80 text-[#6750A4] hover:bg-white'}`}>FR</button>
          <button onClick={() => setLanguage('es')} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${language === 'es' ? 'bg-[#6750A4] text-white' : 'bg-white/80 text-[#6750A4] hover:bg-white'}`}>ES</button>
        </div>
        
        {activeTab === 'studio' ? (
          <ScratchPanel />
        ) : (
          <DiscoverPanel 
            onUseInStudio={(prompt) => {
              setPrompt(prompt);
              setActiveTab('studio');
            }}
            onImageClick={(image) => setFullscreenImage(image)}
          />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center h-16">
            <div className="flex bg-gray-100 rounded-full p-1 relative">
              <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
                  activeTab === 'studio' ? 'left-1' : 'left-[calc(50%)]'
                }`}
              />
              <button
                data-tab="studio"
                onClick={() => setActiveTab('studio')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'studio' 
                    ? 'text-[#6750A4] font-semibold' 
                    : 'text-gray-800 hover:text-gray-800'
                }`}
              >
                Studio
              </button>
              <button
                data-tab="discover"
                onClick={() => setActiveTab('discover')}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === 'discover' 
                    ? 'text-[#6750A4] font-semibold' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Discover
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tam ekran görsel modal */}
      {fullscreenImage && (
        <FullscreenImageModal 
          image={fullscreenImage} 
          onClose={() => setFullscreenImage(null)} 
        />
      )}
    </div>
  );
};

// Discover Panel Component
const DiscoverPanel: React.FC<{ 
  onUseInStudio: (prompt: string) => void;
  onImageClick: (image: string) => void;
}> = ({ onUseInStudio, onImageClick }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('time-travel-cat');
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const promptCategories = {
    'time-travel-cat': {
      title: 'Time Travel Cat',
      description: 'Transform your cat through different historical eras',
      prompts: [
        {
          title: 'Ancient Egypt Cat',
          prompt: 'A majestic cat wearing a golden pharaoh crown, sitting on a throne in ancient Egyptian palace, hieroglyphics on walls, golden light, photorealistic',
          image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Medieval Knight Cat',
          prompt: 'A brave cat in medieval knight armor, holding a tiny sword, standing in a castle courtyard, dramatic lighting, photorealistic',
          image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Victorian Era Cat',
          prompt: 'An elegant cat in Victorian era clothing, sitting in a luxurious parlor with vintage furniture, soft candlelight, photorealistic',
          image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=96&h=96&fit=crop&crop=center'
        }
      ]
    },
    'virtual-store': {
      title: 'Virtual Store Creation',
      description: 'Create stunning product photography in different environments',
      prompts: [
        {
          title: 'Luxury Boutique',
          prompt: 'A sophisticated luxury boutique interior with elegant lighting, marble floors, golden accents, modern minimalist design, photorealistic',
          image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Cozy Bookstore',
          prompt: 'A warm and inviting bookstore with wooden shelves, comfortable reading chairs, soft lighting, books everywhere, photorealistic',
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Modern Tech Store',
          prompt: 'A sleek modern technology store with glass displays, LED lighting, futuristic design elements, clean lines, photorealistic',
          image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=96&h=96&fit=crop&crop=center'
        }
      ]
    },
    'daily-royalty': {
      title: 'Daily Life Royalty',
      description: 'Transform everyday activities into royal experiences',
      prompts: [
        {
          title: 'Royal Breakfast',
          prompt: 'A luxurious breakfast table set with golden plates, crystal glasses, fresh flowers, elegant morning light, photorealistic',
          image: 'https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Garden Tea Party',
          prompt: 'An elegant garden tea party with vintage teacups, tiered cake stands, blooming flowers, afternoon sunlight, photorealistic',
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=96&h=96&fit=crop&crop=center'
        },
        {
          title: 'Evening Ballroom',
          prompt: 'A grand ballroom with chandeliers, marble floors, elegant dancers in formal attire, romantic evening atmosphere, photorealistic',
          image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=96&h=96&fit=crop&crop=center'
        }
      ]
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt);
  };

  const handleGenerateFromPrompt = async () => {
    if (!selectedPrompt) return;
    
    setIsGenerating(true);
    try {
      const res = await generateOrEditImage(selectedPrompt);
      if (res.type === 'image') {
        setGeneratedImage(`data:image/png;base64,${res.data}`);
      } else {
        setGeneratedImage('https://via.placeholder.com/400?text=Error');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      setGeneratedImage('https://via.placeholder.com/400?text=Error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseInStudio = () => {
    if (selectedPrompt) {
      onUseInStudio(selectedPrompt);
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#6750A4] mb-4">Discover Amazing Prompts</h1>
        <p className="text-gray-600 text-lg">Explore creative prompts and see what AI can create</p>
      </div>
      <div className="flex gap-4 mb-8 justify-center flex-wrap">
        {Object.entries(promptCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === key
                ? 'bg-[#6750A4] text-white shadow-lg scale-105'
                : 'bg-white/80 text-[#6750A4] hover:bg-white hover:scale-102'
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#6750A4] mb-4">
            {promptCategories[selectedCategory as keyof typeof promptCategories].title}
          </h2>
          <p className="text-gray-600 mb-6">
            {promptCategories[selectedCategory as keyof typeof promptCategories].description}
          </p>
          {promptCategories[selectedCategory as keyof typeof promptCategories].prompts.map((prompt, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedPrompt === prompt.prompt
                  ? 'border-[#6750A4] bg-[#6750A4]/5'
                  : 'border-gray-200 bg-white/60 hover:border-[#6750A4]/30'
              }`}
              onClick={() => handlePromptSelect(prompt.prompt)}
            >
              <div className="flex items-start gap-3">
                <img 
                  src={prompt.image} 
                  alt={prompt.title}
                  className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{prompt.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{prompt.prompt}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-[#6750A4] mb-4">Try This Prompt</h2>
          {selectedPrompt && (
            <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50">
              <h3 className="font-medium text-gray-800 mb-3">Selected Prompt:</h3>
              <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-lg">
                {selectedPrompt}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleGenerateFromPrompt}
                  disabled={isGenerating}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                    isGenerating
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#6750A4] text-white hover:bg-[#6750A4]/90 hover:scale-105'
                  }`}
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </button>
                <button
                  onClick={handleUseInStudio}
                  className="w-full py-3 px-4 rounded-lg font-medium bg-white text-[#6750A4] border-2 border-[#6750A4] hover:bg-[#6750A4] hover:text-white transition-all duration-300 hover:scale-105"
                >
                  Use in Studio
                </button>
              </div>
            </div>
          )}
          {generatedImage && (
            <div className="bg-white/60 rounded-xl p-6 border border-gray-200/50">
              <h3 className="font-medium text-gray-800 mb-3">Generated Result:</h3>
              <div className="relative group">
                <img 
                  src={generatedImage} 
                  alt="AI Generated Image"
                  className="w-full rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                  onClick={() => onImageClick(generatedImage)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <button onClick={handleUseInStudio} className="opacity-0 group-hover:opacity-100 bg-white text-[#6750A4] px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-110">
                    Use in Studio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;