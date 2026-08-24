'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause } from 'lucide-react';

interface NarratorCardProps {
  name: string;
  role: string;
  demographics: string;
  image: string;
  audio: string;
}

export default function NarratorCard({ name, role, demographics, image, audio }: NarratorCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleAudio = () => {
    if (!audioElement) {
      const newAudio = new Audio(audio);
      newAudio.onended = () => setIsPlaying(false);
      setAudioElement(newAudio);
      newAudio.play().catch(err => console.log('Audio playback failed:', err));
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audioElement.pause();
        setIsPlaying(false);
      } else {
        audioElement.play().catch(err => console.log('Audio playback failed:', err));
        setIsPlaying(true);
      }
    }
  };

  return (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group">
      <CardContent className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <Image
              src={image}
              alt={name}
              width={96}
              height={96}
              className="rounded-full shadow-xl group-hover:scale-110 transition-transform object-cover"
            />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{name}</h3>
          <p className="text-lg font-semibold text-[#1A5F7A] mb-2">{role}</p>
          <p className="text-sm text-gray-500">{demographics}</p>
        </div>
        <button
          onClick={toggleAudio}
          className="mx-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white rounded-full hover:shadow-lg transition-all hover:scale-105"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Pause' : 'Listen'}
        </button>
      </CardContent>
    </Card>
  );
}
