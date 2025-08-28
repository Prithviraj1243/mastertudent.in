import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Download, 
  Star, 
  Clock, 
  Heart,
  StarIcon,
  TrendingUp,
  Award,
  Eye,
  BookOpen
} from "lucide-react";
import { Note } from "@shared/schema";

// Helper function to get subject colors
const getSubjectColor = (subject: string) => {
  const colors: { [key: string]: string } = {
    'Mathematics': 'bg-blue-100 text-blue-800',
    'Physics': 'bg-purple-100 text-purple-800',
    'Chemistry': 'bg-green-100 text-green-800',
    'Biology': 'bg-emerald-100 text-emerald-800',
    'Computer Science': 'bg-gray-100 text-gray-800',
    'English': 'bg-red-100 text-red-800',
    'History': 'bg-amber-100 text-amber-800',
    'Geography': 'bg-cyan-100 text-cyan-800',
    'Economics': 'bg-yellow-100 text-yellow-800',
    'Political Science': 'bg-indigo-100 text-indigo-800'
  };
  return colors[subject] || 'bg-gray-100 text-gray-800';
};

// Helper function to get subject icons
const getSubjectIcon = (subject: string) => {
  const icons: { [key: string]: string } = {
    'Mathematics': '📐',
    'Physics': '⚛️',
    'Chemistry': '🧪',
    'Biology': '🧬',
    'Computer Science': '💻',
    'English': '📚',
    'History': '📜',
    'Geography': '🌍',
    'Economics': '💰',
    'Political Science': '🏛️'
  };
  return icons[subject] || '📖';
};

interface NoteCardProps {
  note: Note;
  viewMode?: "grid" | "list";
}

export default function NoteCard({ note, viewMode = "grid" }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (viewMode === "list") {
    return (
      <Card className="note-card hover:shadow-md transition-all duration-200" data-testid={`note-card-${note.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Link href={`/notes/${note.id}`}>
                    <a className="text-lg font-semibold text-foreground hover:text-primary transition-colors" data-testid="link-note-title">
                      {note.title}
                    </a>
                  </Link>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span data-testid="text-note-subject">{note.subject}</span>
                    <span>•</span>
                    <span data-testid="text-note-class">{note.classGrade}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {note.featured && (
                    <Badge className="bg-green-100 text-green-800">Featured</Badge>
                  )}
                  <Button size="sm" data-testid="button-favorite">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2" data-testid="text-note-description">
                {note.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(note.topper?.firstName + ' ' + note.topper?.lastName || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground" data-testid="text-topper-name">
                      {note.topper?.firstName} {note.topper?.lastName}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon key={star} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">4.8</span>
                  </div>
                  
                  <span className="text-xs text-muted-foreground" data-testid="text-downloads-count">
                    <Download className="h-3 w-3 inline mr-1" />
                    {note.downloadsCount} downloads
                  </span>
                  
                  <span className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {formatDate(note.publishedAt || note.createdAt)}
                  </span>
                </div>
                
                <Link href={`/notes/${note.id}`}>
                  <Button size="sm" data-testid="button-view-note">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className="card-enhanced hover-lift transition-all duration-300 group relative overflow-hidden" data-testid={`note-card-${note.id}`}>
      {/* Gradient overlay for featured notes */}
      {note.featured && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
      )}
      
      <CardContent className="p-6">
        {/* Header with badges */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className={`${getSubjectColor(note.subject)} hover-scale`}>
              <span className="mr-1">{getSubjectIcon(note.subject)}</span>
              {note.subject}
            </Badge>
            {note.featured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse-slow">
                <Award className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="hover-scale opacity-0 group-hover:opacity-100 transition-opacity"
            data-testid="button-favorite"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        {/* Title and description */}
        <div className="mb-4">
          <Link href={`/notes/${note.id}`}>
            <a className="text-lg font-bold text-foreground mb-2 block hover:text-primary transition-colors line-clamp-2 group-hover:text-primary" data-testid="link-note-title">
              {note.title}
            </a>
          </Link>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-3" data-testid="text-note-description">
            {note.description}
          </p>
          <Badge variant="outline" className="text-xs">
            {note.classGrade}
          </Badge>
        </div>
        
        {/* Author info */}
        <div className="flex items-center space-x-3 mb-4 p-3 bg-muted/30 rounded-lg">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
              {getInitials(note.topperId || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground" data-testid="text-topper-name">
              Top Student
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon key={star} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">4.8</span>
              <Badge variant="secondary" className="text-xs">
                <Award className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <Download className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-blue-800">{note.downloadsCount || 0}</div>
            <div className="text-xs text-blue-600">Downloads</div>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <Eye className="h-4 w-4 text-green-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-green-800">1.2k</div>
            <div className="text-xs text-green-600">Views</div>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <TrendingUp className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <div className="text-sm font-semibold text-purple-800">95%</div>
            <div className="text-xs text-purple-600">Helpful</div>
          </div>
        </div>

        {/* Action button */}
        <Link href={`/notes/${note.id}`}>
          <Button className="w-full button-glow hover-scale group" data-testid="button-download-note">
            <BookOpen className="h-4 w-4 mr-2 group-hover:animate-bounce" />
            View & Download
          </Button>
        </Link>

        {/* Time stamp */}
        <div className="mt-3 text-center">
          <span className="text-xs text-muted-foreground">
            <Clock className="h-3 w-3 inline mr-1" />
            Updated {formatDate(note.publishedAt || note.createdAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
