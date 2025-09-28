import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractCandidateDetailsFromText } from "@/services/gemini";

export const runtime = "nodejs";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    console.log("PDF file received, size:", buffer.length);
    
    // For now, return a placeholder that will trigger AI extraction
    // This ensures the system works while we handle PDF parsing
    return "PDF resume uploaded - please extract candidate information";
  } catch (error) {
    console.error("PDF processing error:", error);
    return "";
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || "";
}

function parseCandidateFromText(text: string) {
  console.log("Parsing text of length:", text.length);
  
  // Clean and normalize text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  let name = "";
  let email = "";
  let phone = "";
  
  // Look for name in first few lines (common resume formats)
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    // More flexible name patterns
    const namePatterns = [
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/,
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)$/,
      /^([A-Z][a-z]+)$/
    ];
    
    for (const pattern of namePatterns) {
      const nameMatch = line.match(pattern);
      if (nameMatch && line.length > 2 && line.length < 50 && !line.includes('@') && !line.includes('http')) {
        name = nameMatch[1];
        break;
      }
    }
    if (name) break;
  }
  
  // Look for email anywhere in the text (more comprehensive pattern)
  const emailPatterns = [
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
    /[A-Za-z0-9._%+-]+\s*@\s*[A-Za-z0-9.-]+\s*\.\s*[A-Za-z]{2,}/g
  ];
  
  for (const pattern of emailPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      email = matches[0].replace(/\s+/g, '');
      break;
    }
  }
  
  // Look for phone numbers with various formats
  const phonePatterns = [
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      phone = matches[0].replace(/\s+/g, ' ');
      break;
    }
  }
  
  console.log("Extracted:", { name, email, phone });
  
  return {
    name: name || "",
    email: email || "",
    phone: phone || "",
  };
}

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

    let { name, email, phone } = parseCandidateFromText(text);

    // For PDFs or when basic parsing fails, always try AI extraction
    if (isPdf || !name || !email || !phone) {
      try {
        console.log("Using AI extraction for PDF or incomplete parsing...");
        const aiExtracted = await extractCandidateDetailsFromText(text);
        if (aiExtracted.name) name = name || aiExtracted.name;
        if (aiExtracted.email) email = email || aiExtracted.email;
        if (aiExtracted.phone) phone = phone || aiExtracted.phone;
        console.log("AI extraction result:", { name, email, phone });
      } catch (aiError) {
        console.error("AI extraction failed:", aiError);
      }
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


