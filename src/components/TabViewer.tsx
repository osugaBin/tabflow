import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as Tone from 'tone';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize,
  Minimize,
  Maximize2, 
  Minimize2, 
  ZoomIn,
  ZoomOut, 
  Play, 
  Pause, 
  Settings2,
  X,
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { RhythmController } from './RhythmController';

import { Tab, ScoreType } from '@/src/types';

// Setup worker for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface TabViewerProps {
  tab: Tab;
  onClose: () => void;
}

export function TabViewer({ tab, onClose }: TabViewerProps) {
  const { pdfUrl, title, scoreType } = tab;
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(4); // pixels per interval (adjusted for ~3 mins/page)
  const [showRhythm, setShowRhythm] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [isPlaying, setIsPlaying] = useState(false);
  
  useEffect(() => {
    const isSmallScreen = window.innerWidth < 1024;
    if (isSmallScreen) {
      setIsFullScreen(true);
      // Set an initial fit-friendly scale for smaller devices
      if (window.innerWidth < 640) {
        setScale(0.65); // Phones
      } else {
        setScale(0.85); // Tablets
      }
    }
  }, []);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<number | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  const scrollSpeedRef = useRef(scrollSpeed);
  const viewportRef = useRef<HTMLDivElement>(null);
  const accumulatedScrollRef = useRef(0);

  useEffect(() => {
    scrollSpeedRef.current = scrollSpeed;
  }, [scrollSpeed]);

  useEffect(() => {
    if (isScrolling) {
      accumulatedScrollRef.current = 0;
      scrollIntervalRef.current = window.setInterval(() => {
        if (viewportRef.current) {
          const delta = scrollSpeedRef.current / 10;
          accumulatedScrollRef.current += delta;
          
          if (accumulatedScrollRef.current >= 1) {
            const scrollAmount = Math.floor(accumulatedScrollRef.current);
            viewportRef.current.scrollBy({ top: scrollAmount, behavior: 'auto' });
            accumulatedScrollRef.current -= scrollAmount;
          }
        }
      }, 50);
    } else {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      accumulatedScrollRef.current = 0;
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [isScrolling]);

  const isImage = scoreType === 'Image';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-background ${isFullScreen ? 'p-0' : 'p-4'}`}
    >
      <header className="bg-card border-b border-white/5 p-4 flex flex-col md:flex-row items-center justify-between z-20 shrink-0 min-h-[5rem] h-auto gap-4 px-4 md:px-6">
        <div className="flex items-center justify-between w-full md:w-1/4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/5 rounded-xl"><X className="w-5 h-5 text-slate-400" /></Button>
            <div className="border-l border-white/10 pl-4">
              <h2 className="text-xs md:text-sm font-black tracking-tight text-white uppercase truncate max-w-[120px] md:max-w-[200px]">{title}</h2>
              <p className="text-[8px] md:text-[9px] font-black uppercase text-primary tracking-widest leading-tight">
                {isImage ? 'Image Score' : `Page ${pageNumber} of ${numPages || '?'}`}
              </p>
            </div>
          </div>
          <div className="flex md:hidden items-center gap-4">
             <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="w-3 h-3 text-slate-400" /></Button>
                <div className="flex items-center px-0.5">
                  <input 
                    type="number"
                    value={Math.round(scale * 100)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val)) {
                        setScale(Math.max(0.1, Math.min(5, val / 100)));
                      }
                    }}
                    className="bg-transparent text-[9px] font-mono w-8 text-right font-bold text-slate-400 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-500">%</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={() => setScale(s => Math.min(3, s + 0.1))}><ZoomIn className="w-3 h-3 text-slate-400" /></Button>
             </div>
             <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="hover:bg-white/5 rounded-xl">
               {isFullScreen ? <Minimize className="w-5 h-5 text-primary" /> : <Maximize className="w-5 h-5 text-slate-400" />}
             </Button>
          </div>
        </div>

        {/* Central Control Hub - now visible on all screens with responsive adjustments */}
        <div className="flex items-center gap-3 md:gap-8 bg-slate-900/50 px-3 md:px-6 py-2 rounded-2xl border border-white/5 shadow-inner w-full md:w-auto">
          {/* Scroll Section */}
          <div className="flex items-center gap-3 md:gap-4 border-r border-white/5 pr-4 md:pr-8 shrink-0">
            <div className="flex flex-col min-w-[50px] md:min-w-[60px]">
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Scroll Speed</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border border-white/5">
                  <button 
                    className="text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setScrollSpeed(s => Math.max(0, s - 1))}
                  >
                    <ChevronDown className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                  </button>
                  <input 
                    type="number"
                    value={scrollSpeed}
                    onChange={(e) => setScrollSpeed(Math.min(200, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="bg-transparent text-[10px] md:text-xs font-mono font-black text-white w-6 md:w-8 text-center outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    className="text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setScrollSpeed(s => Math.min(200, s + 1))}
                  >
                    <ChevronUp className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                  </button>
                  <span className="text-[7px] font-bold text-slate-500">SPD</span>
                </div>
                <div className="hidden sm:block w-16 md:w-24">
                  <Slider 
                    value={[scrollSpeed]} 
                    min={0} 
                    max={200} 
                    onValueChange={(v) => setScrollSpeed(v[0])}
                    className="h-1"
                  />
                </div>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => setIsScrolling(!isScrolling)}
              className={`w-8 h-8 md:w-9 md:h-9 rounded-xl transition-all shrink-0 ${isScrolling ? 'bg-destructive/20 border-destructive/50 text-destructive' : 'bg-primary/10 border-primary/20 text-primary'}`}
            >
              {isScrolling ? <Pause className="w-3 h-3 md:w-4 md:h-4 fill-current" /> : <Play className="w-3 h-3 md:w-4 md:h-4 fill-current" />}
            </Button>
          </div>

          {/* Rhythm Hub */}
          <div className="flex items-center gap-3 md:gap-6 shrink-0">
            <div className="flex flex-col">
              <span className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Rhythm Engine</span>
              <div className="flex items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1 md:gap-1.5 bg-background/80 px-1.5 md:px-2 py-0.5 md:py-1 rounded-lg border border-white/5">
                  <button 
                    className="text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setBpm(b => Math.max(40, b - 1))}
                  >
                    <ChevronDown className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] md:text-xs font-mono font-black text-white w-5 md:w-7 text-center">{bpm}</span>
                  <button 
                    className="text-slate-400 hover:text-primary transition-colors"
                    onClick={() => setBpm(b => Math.min(240, b + 1))}
                  >
                    <ChevronUp className="w-2.5 h-2.5 md:w-3.5 h-3.5" />
                  </button>
                  <span className="text-[7px] font-bold text-slate-500">BPM</span>
                </div>
                
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className={`w-7 h-7 md:w-8 md:h-8 rounded-lg transition-all shrink-0 ${isPlaying ? 'text-primary bg-primary/10' : 'text-slate-500'}`}
                  onClick={async () => {
                    if (Tone.context.state !== 'running') await Tone.start();
                    setIsPlaying(!isPlaying);
                  }}
                >
                  <Play className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isPlaying ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div 
                className={`absolute top-12 md:top-14 left-1/2 -translate-x-1/2 w-80 md:w-96 z-50 origin-top transition-all duration-300 ${
                  showRhythm ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                }`}
              >
                <RhythmController 
                  className="bg-[#1a1d23] border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-3xl p-4 md:p-6 rounded-3xl" 
                  bpm={bpm}
                  setBpm={setBpm}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              </div>
              
              <Button 
                variant="outline" 
                className={`rounded-xl gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest px-3 md:px-4 h-8 md:h-10 transition-all shrink-0 ${showRhythm ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/10 text-slate-400'}`}
                onClick={() => setShowRhythm(!showRhythm)}
              >
                <Clock className={`w-3 h-3 md:w-3.5 md:h-3.5 ${showRhythm ? 'animate-spin-slow' : ''}`} />
                <span className="hidden sm:inline">Controls</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4 w-1/4 justify-end">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5 mr-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setScale(s => Math.max(0.5, s - 0.1))}><ZoomOut className="w-3.5 h-3.5 text-slate-400" /></Button>
            <div className="flex items-center px-1">
              <input 
                type="number"
                value={Math.round(scale * 100)}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) {
                    setScale(Math.max(0.1, Math.min(5, val / 100)));
                  }
                }}
                className="bg-transparent text-[10px] font-mono w-8 text-right font-bold text-slate-400 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-[10px] font-mono font-bold text-slate-500 ml-0.5">%</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setScale(s => Math.min(3, s + 0.1))}><ZoomIn className="w-3.5 h-3.5 text-slate-400" /></Button>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleFullScreen} className="hover:bg-white/5 rounded-xl transition-all active:scale-90">
            {isFullScreen ? <Minimize className="w-5 h-5 text-primary" /> : <Maximize className="w-5 h-5 text-slate-400" />}
          </Button>
        </div>
      </header>

      <div ref={viewportRef} className="flex-1 bg-muted/10 p-4 overflow-y-auto">
        <div className="flex flex-col items-center gap-4 min-h-full py-8">
          {isImage ? (
            <div className="shadow-2xl rounded-sm overflow-hidden bg-white max-w-4xl w-full">
              <img 
                src={pdfUrl} 
                alt={title} 
                style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
                className="w-full h-auto transition-transform duration-200"
              />
            </div>
          ) : (
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="h-[80vh] flex items-center justify-center font-mono opacity-50 text-white">Initializing Stream...</div>}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div key={`page_${index + 1}`} className="mb-8 shadow-2xl rounded-sm overflow-hidden bg-white">
                  <Page 
                    pageNumber={index + 1} 
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full"
                  />
                </div>
              ))}
            </Document>
          )}
        </div>
      </div>

      <footer className="bg-card/50 border-t border-white/5 p-2 flex items-center justify-center z-10 shrink-0 h-10 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 py-1 rounded-full bg-slate-900/40 border border-white/5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setPageNumber(p => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Page {pageNumber} of {numPages || '?'}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </footer>
    </motion.div>
  );
}
