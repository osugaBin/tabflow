import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Play, Square, Volume2, Music, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';

interface RhythmControllerProps {
  className?: string;
  bpm?: number;
  setBpm?: (bpm: number) => void;
  isPlaying?: boolean;
  setIsPlaying?: (playing: boolean) => void;
}

export function RhythmController({ 
  className, 
  bpm: externalBpm, 
  setBpm: externalSetBpm,
  isPlaying: externalIsPlaying,
  setIsPlaying: externalSetIsPlaying
}: RhythmControllerProps) {
  const [internalBpm, setInternalBpm] = useState(120);
  const [internalIsPlaying, setInternalIsPlaying] = useState(false);
  const [volume, setVolume] = useState(-10);
  const [currentRhythm, setCurrentRhythm] = useState<'4/4' | '3/4' | 'Reggae' | 'Rock'>('4/4');

  const bpm = externalBpm !== undefined ? externalBpm : internalBpm;
  const setBpm = externalSetBpm !== undefined ? externalSetBpm : setInternalBpm;
  const isPlaying = externalIsPlaying !== undefined ? externalIsPlaying : internalIsPlaying;
  const setIsPlaying = externalSetIsPlaying !== undefined ? externalSetIsPlaying : setInternalIsPlaying;

  const playerRef = useRef<Tone.Player | null>(null);
  const loopRef = useRef<Tone.Loop | null>(null);

  useEffect(() => {
    // Soft, warm woodblock-style sounds
    const mainSynth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      }
    }).toDestination();

    const subSynth = new Tone.MembraneSynth({
      pitchDecay: 0.005,
      octaves: 1,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        sustain: 0,
        release: 0.1
      }
    }).toDestination();

    // Add a bit of lowpass for warmth
    const filter = new Tone.Filter(2000, "lowpass").toDestination();
    mainSynth.connect(filter);
    subSynth.connect(filter);

    const loop = new Tone.Loop((time) => {
      const beat = Tone.Transport.position.toString().split(':')[1];
      
      if (currentRhythm === '4/4') {
        if (beat === '0') {
          mainSynth.triggerAttackRelease("C3", "32n", time, 1.0);
        } else {
          subSynth.triggerAttackRelease("G2", "32n", time, 0.4);
        }
      } else if (currentRhythm === '3/4') {
        if (beat === '0') {
          mainSynth.triggerAttackRelease("C3", "32n", time, 1.0);
        } else if (beat === '1' || beat === '2') {
          subSynth.triggerAttackRelease("G2", "32n", time, 0.4);
        }
      } else if (currentRhythm === 'Reggae') {
        if (beat === '1' || beat === '3') {
           mainSynth.triggerAttackRelease("G2", "16n", time, 0.6);
        }
      } else if (currentRhythm === 'Rock') {
        if (beat === '0' || beat === '2') {
          mainSynth.triggerAttackRelease("C2", "16n", time, 0.8);
        }
        if (beat === '1' || beat === '3') {
          subSynth.triggerAttackRelease("C4", "32n", time, 0.3);
        }
      }
    }, "4n");

    loopRef.current = loop;
    return () => {
      loop.dispose();
      mainSynth.dispose();
      subSynth.dispose();
      filter.dispose();
    };
  }, [currentRhythm]);

  useEffect(() => {
    Tone.Transport.bpm.value = bpm;
  }, [bpm]);

  useEffect(() => {
    Tone.Destination.volume.value = volume;
  }, [volume]);

  useEffect(() => {
    const handlePlayback = async () => {
      if (isPlaying) {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        Tone.Transport.start();
        loopRef.current?.start(0);
      } else {
        Tone.Transport.stop();
        loopRef.current?.stop();
      }
    };
    handlePlayback();
  }, [isPlaying]);

  const togglePlay = async () => {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    setIsPlaying(!isPlaying);
  };

  const adjustBpm = (delta: number) => {
    setBpm(prev => Math.min(240, Math.max(40, prev + delta)));
  };

  return (
    <div className={`p-4 border rounded-2xl flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`absolute -inset-1 rounded-full bg-primary/20 blur-sm ${isPlaying ? 'animate-pulse' : 'hidden'}`} />
            <Music className="w-4 h-4 text-primary relative" />
          </div>
          <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-white/40">Rhythm Engine</h3>
        </div>
        <div className="flex gap-1.5 bg-background/50 p-1 rounded-lg">
          {(['4/4', '3/4', 'Reggae', 'Rock'] as const).map((r) => (
            <button 
              key={r}
              className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest uppercase transition-all ${
                currentRhythm === r 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              onClick={() => setCurrentRhythm(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <Button 
          variant={isPlaying ? "destructive" : "default"}
          size="icon"
          onClick={togglePlay}
          className="shrink-0 rounded-2xl w-14 h-14 bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/10 transition-transform active:scale-90"
        >
          {isPlaying ? <Square className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
        </Button>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
            <span>Tempo</span>
            <div className="flex items-center gap-2">
              <button 
                className="hover:text-primary transition-colors p-0.5 rounded hover:bg-white/5" 
                onClick={() => adjustBpm(-1)}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <input 
                type="number" 
                value={bpm} 
                onChange={(e) => setBpm(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') adjustBpm(1);
                  if (e.key === 'ArrowDown') adjustBpm(-1);
                }}
                className="w-10 h-6 bg-transparent border-none text-primary font-bold text-center p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none"
              />
              <button 
                className="hover:text-primary transition-colors p-0.5 rounded hover:bg-white/5" 
                onClick={() => adjustBpm(1)}
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <span className="ml-1">BPM</span>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <Slider 
              value={[bpm]} 
              min={40} 
              max={240} 
              step={1} 
              onValueChange={(v) => setBpm(v[0])}
              className="flex-1"
            />
          </div>
        </div>

        <div className="w-20 hidden md:flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-500">
            <Volume2 className="w-3 h-3" />
            <span>Vol</span>
          </div>
          <Slider 
            value={[volume]} 
            min={-40} 
            max={0} 
            step={1} 
            onValueChange={(v) => setVolume(v[0])}
          />
        </div>
      </div>
    </div>
  );
}
