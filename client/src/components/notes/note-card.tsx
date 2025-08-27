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
  StarIcon
} from "lucide-react";
import { Note } from "@shared/schema";

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
    <Card className="note-card hover:shadow-lg transition-all duration-200" data-testid={`note-card-${note.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link href={`/notes/${note.id}`}>
              <a className="text-lg font-semibold text-foreground mb-2 block hover:text-primary transition-colors" data-testid="link-note-title">
                {note.title}
              </a>
            </Link>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
              <span data-testid="text-note-subject">{note.subject}</span>
              <span>•</span>
              <span data-testid="text-note-class">{note.classGrade}</span>
            </div>
          </div>
          {note.featured && (
            <Badge className="bg-green-100 text-green-800">Featured</Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid="text-note-description">
          {note.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(note.topper?.firstName + ' ' + note.topper?.lastName || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground" data-testid="text-topper-name">
                {note.topper?.firstName} {note.topper?.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {note.topper?.topperProfile?.achievements || 'Verified Topper'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} className="h-3 w-3 fill-current" />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">4.8</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
          <span data-testid="text-downloads-count">
            <Download className="h-3 w-3 inline mr-1" />
            {note.downloadsCount} downloads
          </span>
          <span>
            <Clock className="h-3 w-3 inline mr-1" />
            {formatDate(note.publishedAt || note.createdAt)}
          </span>
        </div>
        
        <Link href={`/notes/${note.id}`}>
          <Button className="w-full" data-testid="button-download-note">
            <Download className="h-4 w-4 mr-2" />
            Download Notes
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
