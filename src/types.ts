export type Language = 'Chinese' | 'English';
export type Style = 'Pop' | 'Rock' | 'Reggae' | 'Classic' | 'All';
export type TabType = 'Guitar' | 'Drum';
export type ScoreType = 'PDF' | 'Image';

export interface Tab {
  id: string;
  title: string;
  artist: string;
  language: Language;
  style: Style;
  type: TabType;
  scoreType: ScoreType;
  pdfUrl: string;
  createdAt: string;
  userId: string;
}

export interface Favorite {
  id: string;
  userId: string;
  tabId: string;
  createdAt: string;
}
