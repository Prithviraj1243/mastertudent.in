import { storage } from "./storage";
import crypto from "crypto";

// Sample real notes data
const sampleNotes = [
  {
    title: "Quadratic Equations - Complete Guide",
    subject: "Mathematics" as const,
    topic: "Algebra",
    description: "Comprehensive notes on quadratic equations covering all methods of solving, discriminant analysis, and real-world applications. Includes 50+ solved examples and practice problems.",
    tags: ["algebra", "equations", "mathematics", "class10", "cbse"],
    difficulty: "intermediate",
    estimatedTime: 45,
    price: 10,
    classGrade: "10"
  },
  {
    title: "Laws of Motion - Newton's Laws",
    subject: "Physics" as const, 
    topic: "Mechanics",
    description: "Detailed explanation of Newton's three laws of motion with practical examples, diagrams, and numerical problems. Perfect for JEE and NEET preparation.",
    tags: ["physics", "mechanics", "newton", "laws", "jee", "neet"],
    difficulty: "intermediate",
    estimatedTime: 60,
    price: 15,
    classGrade: "11"
  },
  {
    title: "Organic Chemistry - Hydrocarbons",
    subject: "Chemistry" as const,
    topic: "Organic Chemistry", 
    description: "Complete study material on hydrocarbons including alkanes, alkenes, and alkynes. Covers nomenclature, properties, reactions, and mechanisms.",
    tags: ["chemistry", "organic", "hydrocarbons", "jee", "neet"],
    difficulty: "advanced",
    estimatedTime: 90,
    price: 20,
    classGrade: "11"
  },
  {
    title: "Cell Structure and Function",
    subject: "Biology" as const,
    topic: "Cell Biology",
    description: "Comprehensive notes on cell structure, organelles, and their functions. Includes detailed diagrams and comparison between plant and animal cells.",
    tags: ["biology", "cell", "structure", "organelles", "neet"],
    difficulty: "beginner",
    estimatedTime: 40,
    price: 8,
    classGrade: "9"
  },
  {
    title: "Data Structures - Arrays and Linked Lists",
    subject: "Computer_Science" as const,
    topic: "Data Structures",
    description: "Fundamental concepts of arrays and linked lists with implementation in C++ and Python. Includes time complexity analysis and practice problems.",
    tags: ["programming", "data-structures", "arrays", "linked-lists", "cpp", "python"],
    difficulty: "intermediate",
    estimatedTime: 75,
    price: 25,
    classGrade: "12"
  },
  {
    title: "Trigonometry - Identities and Applications",
    subject: "Mathematics" as const,
    topic: "Trigonometry",
    description: "Complete guide to trigonometric identities, equations, and their applications in real-world problems. Essential for competitive exams.",
    tags: ["mathematics", "trigonometry", "identities", "jee", "competitive"],
    difficulty: "advanced",
    estimatedTime: 80,
    price: 18,
    classGrade: "11"
  },
  {
    title: "Electromagnetic Induction",
    subject: "Physics" as const,
    topic: "Electromagnetism", 
    description: "Detailed study of Faraday's law, Lenz's law, and electromagnetic induction with practical applications and numerical problems.",
    tags: ["physics", "electromagnetism", "induction", "faraday", "jee"],
    difficulty: "advanced",
    estimatedTime: 70,
    price: 22,
    classGrade: "12"
  },
  {
    title: "Chemical Bonding and Molecular Structure",
    subject: "Chemistry" as const,
    topic: "Chemical Bonding",
    description: "Comprehensive notes on ionic, covalent, and metallic bonding. Includes VSEPR theory, hybridization, and molecular orbital theory.",
    tags: ["chemistry", "bonding", "molecular", "vsepr", "hybridization"],
    difficulty: "intermediate",
    estimatedTime: 65,
    price: 16,
    classGrade: "11"
  },
  {
    title: "Photosynthesis and Respiration",
    subject: "Biology" as const,
    topic: "Plant Physiology",
    description: "Detailed mechanism of photosynthesis and cellular respiration with biochemical pathways, enzymes, and energy calculations.",
    tags: ["biology", "photosynthesis", "respiration", "biochemistry", "neet"],
    difficulty: "advanced",
    estimatedTime: 85,
    price: 20,
    classGrade: "11"
  },
  {
    title: "Object-Oriented Programming Concepts",
    subject: "Computer_Science" as const,
    topic: "Programming",
    description: "Fundamental OOP concepts including classes, objects, inheritance, polymorphism, and encapsulation with Java examples.",
    tags: ["programming", "oop", "java", "classes", "inheritance"],
    difficulty: "intermediate",
    estimatedTime: 90,
    price: 28,
    classGrade: "12"
  }
];

// Sample users data
const sampleUsers = [
  {
    email: "rajesh.kumar@example.com",
    firstName: "Rajesh",
    lastName: "Kumar",
    role: "topper" as const,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    coinBalance: 250,
    totalEarned: 1200,
    reputation: 95
  },
  {
    email: "priya.sharma@example.com", 
    firstName: "Priya",
    lastName: "Sharma",
    role: "topper" as const,
    profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coinBalance: 180,
    totalEarned: 800,
    reputation: 88
  },
  {
    email: "amit.singh@example.com",
    firstName: "Amit", 
    lastName: "Singh",
    role: "topper" as const,
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    coinBalance: 320,
    totalEarned: 1500,
    reputation: 92
  },
  {
    email: "student1@example.com",
    firstName: "Arjun",
    lastName: "Patel",
    role: "student" as const,
    coinBalance: 50,
    totalSpent: 150
  },
  {
    email: "student2@example.com", 
    firstName: "Sneha",
    lastName: "Gupta",
    role: "student" as const,
    coinBalance: 75,
    totalSpent: 200
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");
    
    // Create sample users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = await storage.upsertUser({
        id: crypto.randomUUID(),
        ...userData,
        isActive: true,
        onboardingCompleted: true
      });
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }
    
    // Get toppers for note creation
    const toppers = createdUsers.filter(u => u.role === 'topper');
    
    // Create sample notes
    const createdNotes = [];
    for (let i = 0; i < sampleNotes.length; i++) {
      const noteData = sampleNotes[i];
      const randomTopper = toppers[i % toppers.length];
      
      const note = await storage.createNote({
        ...noteData,
        topperId: randomTopper.id,
        status: 'published',
        attachments: [`/uploads/sample-${i + 1}.pdf`],
        downloadsCount: Math.floor(Math.random() * 50) + 5,
        viewsCount: Math.floor(Math.random() * 200) + 20,
        likesCount: Math.floor(Math.random() * 30) + 2,
        categoryId: "fallback-1" // Use fallback category
      });
      
      createdNotes.push(note);
      console.log(`📝 Created note: ${note.title}`);
    }
    
    // Create sample downloads and feedback
    const students = createdUsers.filter(u => u.role === 'student');
    
    for (const student of students) {
      // Each student downloads 3-5 random notes
      const downloadCount = Math.floor(Math.random() * 3) + 3;
      const shuffledNotes = [...createdNotes].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < downloadCount; i++) {
        const note = shuffledNotes[i];
        
        // Record download
        await storage.recordDownload(student.id, note.id);
        
        // 70% chance of leaving feedback
        if (Math.random() < 0.7) {
          const rating = Math.floor(Math.random() * 2) + 4; // 4-5 star ratings mostly
          const comments = [
            "Excellent notes! Very helpful for exam preparation.",
            "Clear explanations and good examples.",
            "Well structured content. Highly recommended!",
            "Perfect for quick revision before exams.",
            "Great quality notes with detailed explanations."
          ];
          
          await storage.createFeedback({
            noteId: note.id,
            studentId: student.id,
            rating,
            comment: comments[Math.floor(Math.random() * comments.length)]
          });
        }
      }
      
      console.log(`📥 Created downloads and feedback for: ${student.firstName}`);
    }
    
    // Create some transactions for earnings simulation
    for (const topper of toppers) {
      const userNotes = createdNotes.filter(n => n.topperId === topper.id);
      let totalEarnings = 0;
      
      for (const note of userNotes) {
        // Simulate earnings from downloads
        const earnings = (note.downloadsCount || 0) * 5;
        totalEarnings += earnings;
        
        if (earnings > 0) {
          await storage.recordTransaction(
            topper.id,
            'coin_earned',
            earnings,
            earnings,
            note.id,
            `Earned ${earnings} coins from note downloads`
          );
        }
      }
      
      // Update user's total earned
      await storage.updateUserCoins(topper.id, totalEarnings - (topper.totalEarned || 0));
    }
    
    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Created: ${createdUsers.length} users, ${createdNotes.length} notes`);
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Function to check if database needs seeding
export async function checkAndSeedDatabase() {
  try {
    // Check if we already have notes
    const { notes } = await storage.getPublishedNotes({ limit: 1 });
    
    if (notes.length === 0) {
      console.log("📋 No notes found, seeding database...");
      await seedDatabase();
    } else {
      console.log("✅ Database already has data, skipping seed");
    }
  } catch (error) {
    console.error("Error checking database:", error);
  }
}
