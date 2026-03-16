import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GuideStoryCardProps {
  genre: string;
  currentPage: number;
  totalPages: number;
  characterDescription: string;
  storyComplete?: boolean;
}

const GENRE_COLORS: Record<string, string> = {
  fantasy: "bg-amber-300/20 text-amber-700 border-amber-300/40",
  mystery: "bg-blue-300/20 text-blue-700 border-blue-300/40",
  scifi: "bg-cyan-300/20 text-cyan-700 border-cyan-300/40",
  romance: "bg-rose-300/20 text-rose-700 border-rose-300/40",
  horror: "bg-purple-300/20 text-purple-700 border-purple-300/40",
  auto: "bg-[#C9B6E4]/20 text-[#6C7A89] border-[#C9B6E4]/40",
};

const GENRE_LABELS: Record<string, string> = {
  fantasy: "Fantasy",
  mystery: "Mystery",
  scifi: "Sci-Fi",
  romance: "Romance",
  horror: "Horror",
  auto: "Story",
};

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export default function GuideStoryCard({
  genre,
  currentPage,
  totalPages,
  characterDescription,
  storyComplete = false,
}: GuideStoryCardProps) {
  const genreColor = GENRE_COLORS[genre] || GENRE_COLORS.auto;
  const genreLabel = GENRE_LABELS[genre] || "Story";
  const progressPercent = totalPages > 0 ? (currentPage / totalPages) * 100 : 0;

  return (
    <div className="rounded-lg border border-[#C9B6E4]/30 bg-white/60 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`text-xs rounded-full ${genreColor}`}>
          {genreLabel}
        </Badge>
        <span className="text-xs text-[#6C7A89]/70">
          {storyComplete
            ? "Complete"
            : `Page ${currentPage} of ${totalPages}`}
        </span>
      </div>

      <p className="text-sm text-[#6C7A89] leading-relaxed">
        {truncate(characterDescription, 80)}
      </p>

      <Progress value={progressPercent} className="h-1.5" />
    </div>
  );
}
