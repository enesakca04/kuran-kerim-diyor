export interface AchievementDef {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { id: 'first_ayah', title: 'İlk Adım', description: 'İlk ayeti okudun', icon: 'BookOpen' },
    { id: 'first_surah', title: 'İlk Sure', description: 'Bir sureyi başından sonuna okudun', icon: 'BookMarked' },
    { id: 'first_comment', title: 'Sesini Duyur', description: 'İlk yorumunu paylaştın', icon: 'MessageSquare' },
    { id: 'first_like', title: 'Beğeni Aldın', description: 'Yorumuna ilk beğeni geldi', icon: 'Heart' },
    { id: 'popular', title: 'Popüler', description: 'Yorumun 10 beğeni aldı', icon: 'TrendingUp' },
    { id: 'halfway', title: 'Yarı Yol', description: 'Kur\'an\'ın yarısını okudun', icon: 'GitCommitHorizontal' },
    { id: 'hatim', title: 'Hatim', description: 'Kur\'an\'ı baştan sona okudun', icon: 'Star' },
];
