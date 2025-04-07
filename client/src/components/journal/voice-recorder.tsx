import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
}

export default function VoiceRecorder({ onTranscription }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [supportsSpeechRecognition, setSupportsSpeechRecognition] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupportsSpeechRecognition(false);
      return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join(' ');
      
      if (event.results[0].isFinal) {
        onTranscription(transcript);
      }
    };
    
    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast({
        title: 'Speech Recognition Error',
        description: `Error: ${event.error}. Please try again.`,
        variant: 'destructive'
      });
      stopRecording();
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscription]);
  
  const startRecording = () => {
    setIsRecording(true);
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
    
    try {
      recognitionRef.current.start();
      toast({
        title: 'Recording started',
        description: 'Speak now. Your speech will be transcribed as you talk.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsRecording(false);
      setIsProcessing(false);
      toast({
        title: 'Failed to start recording',
        description: 'Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  const stopRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsProcessing(true);
      
      try {
        recognitionRef.current.stop();
        toast({
          title: 'Recording finished',
          description: 'Your speech has been transcribed.',
        });
      } catch (error) {
        console.error('Failed to stop recording:', error);
        toast({
          title: 'Failed to process recording',
          description: 'Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  if (!supportsSpeechRecognition) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
        <span>Voice recording is not supported in this browser.</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center space-x-2">
      {isRecording ? (
        <Button 
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          disabled={isProcessing}
          className="flex items-center space-x-1"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          <span>Stop Recording</span>
        </Button>
      ) : (
        <Button 
          onClick={startRecording}
          variant="outline"
          size="sm"
          disabled={isProcessing}
          className="flex items-center space-x-1"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
          <span>Record Voice</span>
        </Button>
      )}
    </div>
  );
}