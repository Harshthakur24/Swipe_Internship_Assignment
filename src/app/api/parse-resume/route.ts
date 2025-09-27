import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";

export const runtime = "nodejs";

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    // For PDF files, we'll implement a basic text extraction
    // Since PDF parsing is complex, we'll return a structured placeholder
    // that will trigger the chatbot to collect information manually
    console.log("PDF file received, size:", buffer.length);
    
    // Return a minimal text that won't match our parsing patterns
    // This will ensure the chatbot collects the information properly
    return "Resume uploaded - PDF format detected. Please provide your details below.";
  } catch (error) {
    console.error("PDF processing error:", error);
    return "Error processing PDF file. Please provide your information manually.";
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || "";
}

function parseCandidateFromText(text: string) {
  // Improved parsing with multiple patterns
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Look for name in first few lines (common resume formats)
  let name = "";
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    // Pattern for names: FirstName LastName or FirstName MiddleName LastName
    const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
    if (nameMatch && line.length > 3 && line.length < 50) {
      name = nameMatch[1];
      break;
    }
  }
  
  // Look for email anywhere in the text
  const emailMatch = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
  
  // Look for phone numbers with various formats
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  
  // If we found a name, email, or phone, return them; otherwise return empty strings
  // This will trigger the chatbot to collect missing information
  return {
    name: name || "",
    email: emailMatch?.[0] || "",
    phone: phoneMatch?.[0]?.replace(/\s+/g, " ") || "",
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

    const { name, email, phone } = parseCandidateFromText(text);

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


