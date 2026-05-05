import { useState, useMemo, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { 
  Search, 
  Plus, 
  Menu, 
  Heart, 
  Music2, 
  Globe, 
  Filter,
  FileText,
  Star,
  Github,
  Trash2,
  Wifi,
  WifiOff,
  Sun,
  Moon
} from 'lucide-react';
import { RhythmController } from '@/src/components/RhythmController';
import { TabViewer } from '@/src/components/TabViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tab, Language, Style, TabType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from './lib/firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const INITIAL_TABS: Tab[] = [
  // English Songs
  {
    id: 'en-1',
    title: 'No Matter What',
    artist: 'Boyzone',
    language: 'English',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Boyzone - No Matter What .pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-2',
    title: "That's Why",
    artist: 'Michael Learns to Rock',
    language: 'English',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/That\'s Why  Michael Learns To Rock.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-3',
    title: 'Let It Be',
    artist: 'The Beatles',
    language: 'English',
    style: 'Rock',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Let it be.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-4',
    title: 'Sweet Home Alabama',
    artist: 'Lynyrd Skynyrd',
    language: 'English',
    style: 'Rock',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Sweet Home Alabama Chords.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-5',
    title: 'Take It Easy',
    artist: 'Eagles',
    language: 'English',
    style: 'Rock',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Take It Easy Chords by Eagles.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-6',
    title: 'Seasons in the Sun',
    artist: 'Westlife',
    language: 'English',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Westlife - Seasons In The Sun .pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-7',
    title: 'Yellow',
    artist: 'Coldplay',
    language: 'English',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/Yellow Chords Y.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'en-8',
    title: 'Super Mario Theme',
    artist: 'Nintendo',
    language: 'English',
    style: 'Classic',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/EN/SuperMarioTab.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  // Chinese Songs
  {
    id: 'cn-1',
    title: 'New Boy',
    artist: '朴树',
    language: 'Chinese',
    style: 'Rock',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/CN/New Boy  朴树.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'cn-2',
    title: '后来',
    artist: '刘若英',
    language: 'Chinese',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/CN/刘若英 - 后来.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'cn-3',
    title: '老男孩',
    artist: '筷子兄弟',
    language: 'Chinese',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/CN/老男孩_C调.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  },
  {
    id: 'cn-4',
    title: '成都',
    artist: '赵雷',
    language: 'Chinese',
    style: 'Pop',
    type: 'Guitar',
    scoreType: 'PDF',
    pdfUrl: '/pdfs/CN/赵雷【成都.pdf',
    createdAt: new Date().toISOString(),
    userId: 'default'
  }
];

export default function App() {
  const [firestoreTabs, setFirestoreTabs] = useState<Tab[]>([]);
  const [localTabs, setLocalTabs] = useState<Tab[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language | 'All'>('All');
  const [selectedStyle, setSelectedStyle] = useState<Style | 'All'>('All');
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [favorites, setFavorites] = useState<string[]>(JSON.parse(localStorage.getItem('favs') || '[]'));
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  // New Tab Form State
  const [newTab, setNewTab] = useState<Partial<Tab>>({
    language: 'English',
    style: 'Pop',
    type: 'Guitar'
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Theme effect
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Subscribe to Tabs
    const q = query(collection(db, 'tabs'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTabs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tab[];
      
      setFirestoreTabs(fetchedTabs.length > 0 ? fetchedTabs : INITIAL_TABS);
    }, (error) => {
      console.error("Firestore Error:", error);
      setFirestoreTabs(INITIAL_TABS); // Fallback
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const tabs = useMemo(() => [...localTabs, ...firestoreTabs], [localTabs, firestoreTabs]);

  useEffect(() => {
    localStorage.setItem('favs', JSON.stringify(favorites));
  }, [favorites]);

  const filteredTabs = useMemo(() => {
    return tabs.filter(tab => {
      const matchesSearch = tab.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (tab.artist && tab.artist.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLang = selectedLanguage === 'All' || tab.language === selectedLanguage;
      const matchesStyle = selectedStyle === 'All' || tab.style === selectedStyle;
      const matchesFav = !showOnlyFavorites || favorites.includes(tab.id);
      return matchesSearch && matchesLang && matchesStyle && matchesFav;
    });
  }, [tabs, searchQuery, selectedLanguage, selectedStyle, favorites, showOnlyFavorites]);

  const toggleFavorite = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  const handleAddTab = async () => {
    if (newTab.title && newTab.pdfUrl) {
      const isLocalFile = newTab.pdfUrl.startsWith('blob:');
      const scoreType = newTab.scoreType || (newTab.pdfUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'Image' : 'PDF');

      if (isLocalFile) {
        // Just add to local state
        const tab: Tab = {
          ...newTab as Tab,
          id: `local-${Date.now()}`,
          scoreType,
          createdAt: new Date().toISOString(),
          userId: 'local-user'
        };
        setLocalTabs(prev => [tab, ...prev]);
        setIsAddDialogOpen(false);
        setNewTab({ language: 'English', style: 'Pop', type: 'Guitar' });
        return;
      }

      try {
        await addDoc(collection(db, 'tabs'), {
          ...newTab,
          scoreType,
          createdAt: serverTimestamp(),
          userId: auth.currentUser?.uid || 'anonymous'
        });
        setIsAddDialogOpen(false);
        setNewTab({ language: 'English', style: 'Pop', type: 'Guitar' });
      } catch (err) {
        console.error("Add Tab Error:", err);
      }
    }
  };

  const deleteTab = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (id.startsWith('local-')) {
      setLocalTabs(prev => prev.filter(t => t.id !== id));
      return;
    }
    try {
      await deleteDoc(doc(db, 'tabs', id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-xl shadow-lg shadow-primary/20">
              <Music2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-black text-xl tracking-tighter bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent hidden md:block">
              STRUM.ARCHIVE
            </h1>
            <div className={`ml-2 px-2 py-0.5 rounded-full flex items-center gap-1.5 ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-80">{isOnline ? 'Dev-Sync Active' : 'Offline Mode'}</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search songs, artists..." 
                className="pl-11 bg-muted/30 border-white/5 rounded-full h-10 text-sm focus-visible:ring-primary/50 focus-visible:bg-muted/50 transition-all font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-xl"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </Button>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger render={<Button size="sm" className="rounded-xl gap-2 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95" />}>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Upload PDF</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Tab</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4 font-sans">
                  <Input 
                    placeholder="Song Title" 
                    value={newTab.title || ''} 
                    onChange={e => setNewTab({...newTab, title: e.target.value})}
                  />
                  <Input 
                    placeholder="Artist" 
                    value={newTab.artist || ''} 
                    onChange={e => setNewTab({...newTab, artist: e.target.value})}
                  />
                  <Input 
                    placeholder="PDF URL (Github Raw link recommended)" 
                    value={newTab.pdfUrl || ''} 
                    onChange={e => setNewTab({...newTab, pdfUrl: e.target.value})}
                  />
                  
                  <div className="relative">
                    <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 py-2 pointer-events-none">
                      <Separator className="flex-1 opacity-20" />
                      <span className="text-[10px] font-black uppercase text-slate-500">OR</span>
                      <Separator className="flex-1 opacity-20" />
                    </div>
                    <div className="pt-8 flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/5 bg-white/5 rounded-2xl hover:border-primary/40 hover:bg-white/10 transition-all cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="application/pdf,image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const localUrl = URL.createObjectURL(file);
                            const scoreType = file.type.startsWith('image/') ? 'Image' : 'PDF';
                            setNewTab({
                              ...newTab, 
                              pdfUrl: localUrl, 
                              scoreType,
                              title: newTab.title || file.name.replace(/\.[^/.]+$/, "")
                            });
                          }
                        }}
                      />
                      <Plus className="w-8 h-8 text-primary/40 mb-2" />
                      <p className="text-xs font-bold text-slate-400">Select PDF or Image</p>
                      <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">Files stay local for this session</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select value={newTab.language} onValueChange={v => setNewTab({...newTab, language: v as Language})}>
                      <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chinese">Chinese</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newTab.style} onValueChange={v => setNewTab({...newTab, style: v as Style})}>
                      <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pop">Pop</SelectItem>
                        <SelectItem value="Rock">Rock</SelectItem>
                        <SelectItem value="Reggae">Reggae</SelectItem>
                        <SelectItem value="Classic">Classic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={newTab.type} onValueChange={v => setNewTab({...newTab, type: v as TabType})}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guitar">Guitar Tab</SelectItem>
                      <SelectItem value="Drum">Drum Tab</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTab} className="w-full">Save Tab</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-6 border-b">
                  <SheetTitle className="flex items-center gap-2">
                    <Music2 className="w-5 h-5 text-primary" />
                    TabFlow
                  </SheetTitle>
                </SheetHeader>
                <SidebarContent 
                  selectedLanguage={selectedLanguage}
                  setSelectedLanguage={setSelectedLanguage}
                  selectedStyle={selectedStyle}
                  setSelectedStyle={setSelectedStyle}
                  showOnlyFavorites={showOnlyFavorites}
                  setShowOnlyFavorites={setShowOnlyFavorites}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="container flex-1 flex gap-0 px-0 md:px-4">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-64 flex-col border-r sticky top-16 h-[calc(100vh-4rem)]">
          <SidebarContent 
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            showOnlyFavorites={showOnlyFavorites}
            setShowOnlyFavorites={setShowOnlyFavorites}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 max-w-full overflow-hidden">
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tighter text-foreground">Your Archive</h2>
              <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em] mt-2 opacity-60 flex items-center gap-2">
                <span className="w-1 h-1 bg-primary rounded-full" />
                {filteredTabs.length} Tracks indexed / {selectedLanguage === 'All' ? 'Global' : selectedLanguage}
              </p>
            </div>
            
            <RhythmController className="xl:w-[480px] bg-card/60 border-white/5 shadow-2xl" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredTabs.map((tab) => (
                <motion.div
                  key={tab.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card 
                    className="group relative overflow-hidden h-52 border-white/5 hover:border-primary/40 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-card/30 backdrop-blur-xl"
                    onClick={() => setActiveTab(tab)}
                  >
                    <div className="p-6 flex flex-col h-full justify-between relative z-10">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest h-5 px-2 bg-muted text-muted-foreground border-border">
                            {tab.type}
                          </Badge>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className={`h-8 w-8 rounded-xl transition-all ${favorites.includes(tab.id) ? 'text-primary bg-primary/10' : 'text-slate-500 hover:bg-white/5'}`}
                              onClick={(e) => toggleFavorite(tab.id, e)}
                            >
                              <Heart className={`w-4 h-4 ${favorites.includes(tab.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-500 opacity-0 group-hover:opacity-100 transition-all hover:text-destructive hover:bg-destructive/10" onClick={(e) => deleteTab(tab.id, e)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-xl leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">{tab.title}</h3>
                          <p className="text-sm text-slate-400 font-medium mt-1 opacity-80">{tab.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-5 border-t border-white/5">
                        <div className="flex gap-2">
                           <Badge variant="outline" className={`text-[9px] px-2 py-0 border-border bg-muted ${tab.language === 'Chinese' ? 'text-blue-500' : 'text-emerald-500'}`}>
                             {tab.language === 'Chinese' ? '🇨🇳 CN' : '🇺🇸 EN'}
                           </Badge>
                           <Badge variant="outline" className="text-[9px] uppercase px-2 py-0 border-border bg-muted text-muted-foreground">
                             {tab.style}
                           </Badge>
                        </div>
                        <div className="bg-white/5 p-1.5 rounded-lg">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                      </div>
                    </div>
                    {/* Subtle glow effect */}
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTabs.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-24 opacity-20 select-none grayscale">
                 <Music2 className="w-16 h-16 mb-4 animate-pulse" />
                 <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Quiet in the Studio</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {activeTab && (
          <TabViewer 
            tab={activeTab} 
            onClose={() => setActiveTab(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ 
  selectedLanguage, 
  setSelectedLanguage,
  selectedStyle,
  setSelectedStyle,
  showOnlyFavorites,
  setShowOnlyFavorites
}: {
  selectedLanguage: Language | 'All',
  setSelectedLanguage: (l: Language | 'All') => void,
  selectedStyle: Style | 'All',
  setSelectedStyle: (s: Style | 'All') => void,
  showOnlyFavorites: boolean,
  setShowOnlyFavorites: (v: boolean) => void
}) {
  return (
    <ScrollArea className="flex-1 py-10 px-6">
      <div className="space-y-10">
        <div>
          <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2 px-2">
             Collections
          </h4>
          <div className="space-y-1">
            <SidebarLink 
              icon={Music2} 
              label="Global Archive" 
              active={selectedLanguage === 'All' && selectedStyle === 'All' && !showOnlyFavorites} 
              onClick={() => { setSelectedLanguage('All'); setSelectedStyle('All'); setShowOnlyFavorites(false); }} 
            />
            <SidebarLink 
              icon={Star} 
              label="My Favorites" 
              active={showOnlyFavorites} 
              onClick={() => setShowOnlyFavorites(true)} 
            />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2 px-2">
             Languages
          </h4>
          <div className="space-y-1">
            <SidebarLink icon={() => <span className="text-xs">🇺🇸</span>} label="English Tabs" active={selectedLanguage === 'English'} onClick={() => { setSelectedLanguage('English'); setShowOnlyFavorites(false); }} />
            <SidebarLink icon={() => <span className="text-xs">🇨🇳</span>} label="中文谱库" active={selectedLanguage === 'Chinese'} onClick={() => { setSelectedLanguage('Chinese'); setShowOnlyFavorites(false); }} />
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase font-black text-slate-500 tracking-[0.3em] mb-4 flex items-center gap-2 px-2">
             Genres
          </h4>
          <div className="space-y-1 text-sm">
            <button onClick={() => { setSelectedStyle('Pop'); setShowOnlyFavorites(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${selectedStyle === 'Pop' ? 'bg-blue-500/10 text-blue-500' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Pop
            </button>
            <button onClick={() => { setSelectedStyle('Rock'); setShowOnlyFavorites(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${selectedStyle === 'Rock' ? 'bg-red-500/10 text-red-500' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="w-2 h-2 rounded-full bg-red-500" /> Rock
            </button>
            <button onClick={() => { setSelectedStyle('Reggae'); setShowOnlyFavorites(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${selectedStyle === 'Reggae' ? 'bg-green-500/10 text-green-500' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="w-2 h-2 rounded-full bg-green-500" /> Reggae
            </button>
            <button onClick={() => { setSelectedStyle('Classic'); setShowOnlyFavorites(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${selectedStyle === 'Classic' ? 'bg-amber-500/10 text-amber-500' : 'text-muted-foreground hover:bg-muted'}`}>
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Classic
            </button>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5">
          <Button variant="outline" className="w-full gap-2 text-[10px] font-black uppercase tracking-widest h-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 transition-all opacity-60 hover:opacity-100" onClick={() => window.open('https://github.com', '_blank')}>
            <Github className="w-4 h-4" /> Open GitHub
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}

function SidebarLink({ icon: Icon, label, active, onClick }: { icon?: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        active 
          ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(var(--color-primary),0.1)]' 
          : 'text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}
