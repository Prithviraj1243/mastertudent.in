import { useEffect } from "react";

interface MetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

export function MetaTags({ 
  title = "MasterStudent - Premium Study Notes from Top Students | CBSE, JEE, NEET, UPSC",
  description = "Access high-quality study notes from top-performing students across CBSE, ICSE, JEE, NEET, UPSC, Engineering, Medical and competitive exams. Subscribe for unlimited downloads and ace your exams with proven study materials.",
  keywords = "study notes, CBSE notes, JEE preparation, NEET study material, UPSC notes, engineering notes, medical notes, competitive exam preparation, top students notes, premium study content, educational platform",
  image = "https://masterstudent.in/og-image.jpg",
  url = "https://masterstudent.in",
  type = "website"
}: MetaTagsProps) {
  
  useEffect(() => {
    // Update document title
    document.title = title;

    // Create or update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic SEO meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', url, true);
    updateMetaTag('og:type', type, true);
    
    // Twitter meta tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
}

// Helper function to generate note-specific meta tags
export function generateNoteMetaTags(note: any, categoryName?: string) {
  const title = `${note.title} - ${note.subject} Notes | MasterStudent`;
  const description = `Download ${note.title} study notes for ${note.subject}${categoryName ? ` in ${categoryName}` : ''}. Created by top students, perfect for ${note.classGrade || 'exam preparation'}. Rating: ${note.averageRating || 'N/A'}/5 stars.`;
  const keywords = `${note.subject} notes, ${note.title}, ${note.classGrade || 'study material'}, ${categoryName || 'exam preparation'}, ${note.topic || 'academic notes'}, study guide, educational content`;
  const url = `https://masterstudent.in/notes/${note.id}`;
  
  return {
    title,
    description,
    keywords,
    url,
    type: "article"
  };
}

// Helper function for category page meta tags
export function generateCategoryMetaTags(categoryName: string, categoryType: string) {
  const title = `${categoryName} Study Notes - ${categoryType.replace('_', ' ')} | MasterStudent`;
  const description = `Explore comprehensive ${categoryName} study notes and materials. Access premium content from top students for ${categoryType.replace('_', ' ')} examination preparation.`;
  const keywords = `${categoryName} notes, ${categoryType.replace('_', ' ')} study material, exam preparation, educational content, study guide, ${categoryName} syllabus`;
  const url = `https://masterstudent.in/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    title,
    description,
    keywords,
    url
  };
}