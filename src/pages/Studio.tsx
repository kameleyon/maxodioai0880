import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { ContentInput } from '../components/studio/ContentInput';
import { ContentSettings, ContentSettingsType } from '../components/studio/ContentSettings';
import { TranscriptEditor } from '../components/studio/TranscriptEditor';
import { AudioPlayer } from '../components/studio/AudioPlayer';
import { PublishConfirmation } from '../components/studio/PublishConfirmation';
import { generateContent } from '../services/openrouter';
import api from '../services/api';
import { AxiosError } from 'axios';

interface GenerateContentParams {
  content: string;
  category: string;
}

interface AudioGenerateParams {
  text: string;
  voice: string;
  pitch?: number;
  speakingRate?: number;
  publish?: boolean;
}

export function Studio() {
  const [content, setContent] = useState('');
  const [settings, setSettings] = useState<ContentSettingsType>({
    category: 'social-media',
    voiceType: 'library',
    voice: 'playht-default'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishSuccessMessage, setPublishSuccessMessage] = useState<string | null>(null);

  const generateFileName = (text: string) => {
    const date = new Date();
    const dateStr = date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '');
    const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    return `${cleanText}${dateStr}`;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const params: GenerateContentParams = {
        content,
        category: settings.category
      };
      
      const generatedContent = await generateContent(params);
      
      setTranscript(generatedContent);
      generateAudio(generatedContent);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAudio = async (textContent: string, publish = false) => {
    setIsGeneratingAudio(true);
    try {
      const params: AudioGenerateParams = {
        text: textContent,
        voice: settings.voice,
        publish
      };

      console.log('Generating audio with params:', params);

      const response = await api.post('/tts/generate', params, {
        responseType: 'arraybuffer'
      });

      // Create blob from array buffer
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      
      // Revoke previous URL if it exists
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      
      // Create new URL
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      if (publish) {
        setPublishSuccessMessage('Audio published successfully!');
        setTimeout(() => setPublishSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Audio generation error:', err);
      let errorMessage = 'Failed to generate audio';
      
      if (err instanceof AxiosError && err.response?.data) {
        try {
          // Convert array buffer to text
          const decoder = new TextDecoder('utf-8');
          const text = decoder.decode(err.response.data);
          const error = JSON.parse(text);
          errorMessage = error.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsGeneratingAudio(false);
      setShowPublishConfirm(false);
    }
  };

  const handlePublish = () => {
    setShowPublishConfirm(true);
  };

  const handlePublishConfirm = () => {
    if (transcript) {
      generateAudio(transcript, true);
    }
  };

  // Cleanup URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Studio</h1>
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/60 text-sm">How does it work? Begin with content creation...</p>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">{error}</div>}
      {publishSuccessMessage && <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">{publishSuccessMessage}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <ContentInput content={content} onChange={setContent} />
          <ContentSettings settings={settings} onChange={setSettings} />
          <button
            onClick={handleGenerate}
            disabled={!content || isGenerating}
            className="w-full px-6 py-3 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium"
          >
            {isGenerating ? 'Generating Content...' : 'Generate'}
          </button>
        </div>

        <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
          {isGenerating ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : transcript ? (
            <TranscriptEditor transcript={transcript} onChange={setTranscript} onRegenerate={generateAudio} />
          ) : (
            <div className="flex items-center justify-center h-full/90">
              <p className="text-white/60 mt-4">Generated content will appear here</p>
            </div>
          )}
        </div>
      </div>

      {transcript && (
        <div className="p-6 bg-white/5 rounded-lg border border-white/10">
          {isGeneratingAudio ? (
            <div className="flex items-center justify-center gap-2 text-white/60 py-4">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Generating audio... can take up to 3-5min</span>
            </div>
          ) : audioUrl ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Generated Audio</h2>
                <button 
                  onClick={handlePublish} 
                  className="px-6 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors text-white font-medium"
                >
                  Publish
                </button>
              </div>
              <AudioPlayer url={audioUrl} label={generateFileName(transcript)} />
            </div>
          ) : null}
        </div>
      )}

      {showPublishConfirm && (
        <PublishConfirmation onConfirm={handlePublishConfirm} onCancel={() => setShowPublishConfirm(false)} />
      )}
    </div>
  );
}
