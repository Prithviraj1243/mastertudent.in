import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Grid, List } from "lucide-react";
import NoteCard from "@/components/notes/note-card";
import { Note } from "@shared/schema";

export default function Catalog() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const { data: notesData, isLoading } = useQuery({
    queryKey: ["/api/notes", { search, subject, classGrade, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (subject) params.append("subject", subject);
      if (classGrade) params.append("classGrade", classGrade);
      params.append("page", page.toString());
      params.append("limit", "20");

      const response = await fetch(`/api/notes?${params}`);
      if (!response.ok) throw new Error("Failed to fetch notes");
      return response.json();
    },
  });

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", 
    "English", "History", "Geography", "Economics", "Political Science"
  ];

  const classes = [
    "Class 9", "Class 10", "Class 11", "Class 12", "Undergraduate", "Postgraduate"
  ];

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-catalog-title">
              Browse Study Notes
            </h1>
            <p className="text-muted-foreground" data-testid="text-catalog-description">
              Discover high-quality notes from top students
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              data-testid="button-grid-view"
            >
              <Grid className="h-4 w-4 mr-2" />
              Grid View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              data-testid="button-list-view"
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search notes by title, topic, or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger className="w-48" data-testid="select-subject">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={classGrade} onValueChange={setClassGrade}>
              <SelectTrigger className="w-48" data-testid="select-class">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notes Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : notesData?.notes?.length > 0 ? (
        <>
          <div 
            className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
            }
            data-testid="notes-container"
          >
            {notesData.notes.map((note: Note) => (
              <NoteCard key={note.id} note={note} viewMode={viewMode} />
            ))}
          </div>

          {/* Pagination */}
          {notesData.total > 20 && (
            <div className="flex items-center justify-center mt-12" data-testid="pagination">
              <nav className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  data-testid="button-prev-page"
                >
                  Previous
                </Button>
                
                <span className="text-sm text-muted-foreground px-4" data-testid="text-page-info">
                  Page {page} of {Math.ceil(notesData.total / 20)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(notesData.total / 20)}
                  data-testid="button-next-page"
                >
                  Next
                </Button>
              </nav>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12" data-testid="empty-state">
          <div className="text-muted-foreground mb-4">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No notes found</h3>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}
    </div>
  );
}
