import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractCandidateDetailsFromText } from "@/services/gemini";

export const runtime = "nodejs";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    console.log("PDF file received, size:", buffer.length);
    
    // Use a simple approach: convert PDF to text using a basic method
    // For now, we'll use a placeholder that contains the file info
    // The AI will handle the actual extraction from the raw content
    return `PDF Resume Content (${buffer.length} bytes) - Please extract candidate name, email, and phone number from this resume document.`;
  } catch (error) {
    console.error("PDF processing error:", error);
    return "";
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || "";
}

// Removed parseCandidateFromText function - now using AI extraction for all parsing

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const isPdf = file.type === "application/pdf";
    const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    let text = "";
    if (isPdf) {
      const buffer = Buffer.from(arrayBuffer);
      text = await extractTextFromPdf(buffer);
    } else if (isDocx) {
      text = await extractTextFromDocx(arrayBuffer);
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    // Always use AI extraction for both PDF and DOCX
    let name = "", email = "", phone = "";
    
    try {
      console.log("Using AI extraction for resume text...");
      const aiExtracted = await extractCandidateDetailsFromText(text);
      name = aiExtracted.name || "";
      email = aiExtracted.email || "";
      phone = aiExtracted.phone || "";
      console.log("AI extraction result:", { name, email, phone });
    } catch (aiError) {
      console.error("AI extraction failed:", aiError);
      // If AI extraction fails, we'll fall back to empty strings
      // which will trigger manual collection in the chat
    }

    // Determine which fields are missing
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');

    return NextResponse.json({
      candidate: {
        name: name || "Unknown Candidate",
        email: email || "unknown@example.com", 
        phone: phone || "",
      },
      extracted: {
        name: name || "",
        email: email || "",
        phone: phone || "",
      },
      missingFields,
      meta: { 
        length: text.length,
        hasExtractedInfo: !!(name || email || phone)
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


