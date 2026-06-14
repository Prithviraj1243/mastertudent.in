/**
 * Import Class 11 Biology chapter PDFs into Supabase (storage + notes table).
 * Usage: npx tsx scripts/import-class11-biology.ts [folder-path]
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabaseAdmin } from "../server/supabase";

const NOTES_DIR =
  process.argv[2] ||
  "/Users/prithviraj/Downloads/drive-download-20260614T034137Z-3-001";
const BUCKET = process.env.SUPABASE_BUCKET_NAME || "notes";
const CLASS_GRADE = "Class 11";
const SUBJECT = "Biology";
const TOPPER_EMAIL = "notes@masterstudent.in";

function parseChapter(filename: string): { num: number; title: string } | null {
  const match = filename.match(/Chapter\s*-?\s*(\d+)\s+(.+?)\.pdf$/i);
  if (!match) return null;
  const title = match[2].trim().replace(/\s*\(\d+\)\s*$/, "");
  return { num: parseInt(match[1], 10), title };
}

function pickPdfFiles(dir: string): Map<number, { filename: string; title: string }> {
  const chapters = new Map<number, { filename: string; title: string }>();
  for (const filename of fs.readdirSync(dir)) {
    if (!filename.toLowerCase().endsWith(".pdf")) continue;
    const parsed = parseChapter(filename);
    if (!parsed) continue;
    const existing = chapters.get(parsed.num);
    if (!existing || (existing.filename.includes("(1)") && !filename.includes("(1)"))) {
      chapters.set(parsed.num, { filename, title: parsed.title });
    }
  }
  return chapters;
}

async function getOrCreateTopperId(): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", TOPPER_EMAIL)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("users").insert({
    id,
    email: TOPPER_EMAIL,
    first_name: "Master",
    last_name: "Student",
    role: "topper",
    login_provider: "system",
    onboarding_completed: true,
    coin_balance: 0,
    free_downloads_left: 0,
    reputation: 0,
    streak: 0,
    total_earned: 0,
    total_spent: 0,
    is_active: true,
    created_at: now,
    updated_at: now,
  });
  if (error) throw new Error(`Failed to create topper user: ${error.message}`);
  return id;
}

async function uploadPdf(localPath: string, userId: string): Promise<string> {
  const buffer = fs.readFileSync(localPath);
  const storagePath = `${userId}/Biology/${crypto.randomUUID()}.pdf`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(storagePath, buffer, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed for ${localPath}: ${error.message}`);
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  if (!fs.existsSync(NOTES_DIR)) {
    console.error("Folder not found:", NOTES_DIR);
    process.exit(1);
  }

  const chapters = pickPdfFiles(NOTES_DIR);
  if (chapters.size === 0) {
    console.error("No PDF chapter files found in:", NOTES_DIR);
    process.exit(1);
  }

  console.log(`Found ${chapters.size} Biology chapters in ${NOTES_DIR}`);
  const topperId = await getOrCreateTopperId();
  console.log("Topper user:", topperId);

  let created = 0;
  let skipped = 0;

  for (const num of [...chapters.keys()].sort((a, b) => a - b)) {
    const { filename, title } = chapters.get(num)!;
    const noteTitle = `Class 11 Biology - Chapter ${num}: ${title}`;
    const topic = `Chapter ${num}: ${title}`;

    const { data: existing } = await supabaseAdmin
      .from("notes")
      .select("id")
      .eq("title", noteTitle)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Skip (exists): ${noteTitle}`);
      skipped++;
      continue;
    }

    const localPath = path.join(NOTES_DIR, filename);
    console.log(`📤 Uploading chapter ${num}: ${filename}`);
    const fileUrl = await uploadPdf(localPath, topperId);

    const now = new Date().toISOString();
    const { error } = await supabaseAdmin.from("notes").insert({
      id: crypto.randomUUID(),
      title: noteTitle,
      subject: SUBJECT,
      topic,
      class_grade: CLASS_GRADE,
      description: `NCERT Class 11 Biology — Chapter ${num}: ${title}. Complete notes with key concepts, diagrams, and exam-focused content.`,
      attachments: [fileUrl],
      topper_id: topperId,
      status: "published",
      type: "notes",
      price: 5,
      published_at: now,
      downloads_count: 0,
      views_count: 0,
      likes_count: 0,
      created_at: now,
      updated_at: now,
    });

    if (error) {
      console.error(`❌ DB insert failed for chapter ${num}:`, error.message);
      continue;
    }

    console.log(`✅ Published: ${noteTitle}`);
    created++;
  }

  console.log(`\nDone — created: ${created}, skipped: ${skipped}, total chapters: ${chapters.size}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
