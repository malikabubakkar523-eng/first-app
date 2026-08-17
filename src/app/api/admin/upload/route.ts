import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-matroska",
  "video/mp2t",
  "video/3gpp",
]);

const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60 MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin credentials required." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No media file provided." }, { status: 400 });
    }

    const mime = file.type.toLowerCase();
    const isImage = ALLOWED_IMAGE_TYPES.has(mime);
    const isVideo = ALLOWED_VIDEO_TYPES.has(mime) || file.name.match(/\.(mp4|webm|mov|ogg|mkv)$/i);

    // Validate MIME type
    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Supported formats: Images (JPEG, PNG, WebP, AVIF, GIF, SVG) and Videos (MP4, WebM, QuickTime MOV, OGG).",
        },
        { status: 400 }
      );
    }

    // Validate file size
    const limit = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > limit) {
      return NextResponse.json(
        { error: `File size exceeds the ${isVideo ? "60MB" : "15MB"} limit.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate safe unique filename
    const originalName = file.name || "upload.jpg";
    const extension = path.extname(originalName).toLowerCase() || ".jpg";
    const safeBaseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const uniqueHash = crypto.randomBytes(6).toString("hex");
    const filename = `${safeBaseName}_${Date.now()}_${uniqueHash}${extension}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: filename,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  } catch (error: any) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
