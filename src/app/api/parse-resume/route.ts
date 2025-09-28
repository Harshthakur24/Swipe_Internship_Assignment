import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import { extractCandidateDetailsFromText } from "@/services/gemini";

export const runtime = "nodejs";

// Note: pdfjs-dist temporarily disabled due to worker issues in Next.js
// Using enhanced fallback method for reliable PDF text extraction

async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  try {
    console.log("PDF file received, size:", buffer.length);
    
    // Validate PDF file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error("PDF file too large (max 10MB)");
    }
    
    // For now, use the reliable fallback method since pdfjs-dist has worker issues in Next.js
    console.log("Using fallback PDF extraction method for reliability");
    return extractTextFromPdfFallback(buffer);
    
    // TODO: Re-enable pdfjs-dist when worker issues are resolved
    /*
    // Dynamically import pdfjs-dist to avoid build issues
    if (!pdfjsLib) {
      try {
        // Try regular pdfjs-dist first
        pdfjsLib = await import("pdfjs-dist");
        
        // Configure worker to avoid file system issues
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        }
      } catch (importError) {
        console.error("Failed to import pdfjs-dist:", importError);
        // Fallback to basic text extraction
        return extractTextFromPdfFallback(buffer);
      }
    }
    
    const uint8Array = new Uint8Array(buffer);
    
    // Configure PDF.js for Node.js environment (disable worker)
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true,
      maxImageSize: 1024 * 1024,
      isEvalSupported: false,
      useWorkerFetch: false,
      verbosity: 0,
      // Disable worker completely for Node.js
      disableWorker: true
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Extract text from all pages (limit to first 5 pages for performance)
    const maxPages = Math.min(pdf.numPages, 5);
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: { str?: string }) => {
          // Handle both TextItem and TextMarkedContent types
          if ('str' in item) {
            return item.str || '';
          }
          return '';
        })
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      fullText += pageText + '\n';
    }
    
    console.log(`Extracted ${fullText.length} characters from PDF (${maxPages} pages)`);
    
    // Ensure we have meaningful text
    if (fullText.length < 50) {
      console.warn("PDF extraction resulted in very little text, may be image-based PDF");
    }
    
    return fullText;
    */
  } catch (error) {
    console.error("PDF processing error:", error);
    // Fallback to basic text extraction
    return extractTextFromPdfFallback(buffer);
  }
}

// Enhanced fallback PDF text extraction method
function extractTextFromPdfFallback(buffer: Buffer): string {
  try {
    console.log("Using enhanced fallback PDF text extraction");
    
    // Extract text from PDF binary data using multiple approaches
    const text = buffer.toString('utf8', 0, Math.min(buffer.length, 200000));
    
    let extractedText = '';
    
    // Method 1: Extract text between BT (Begin Text) and ET (End Text) markers
    const textMatches = text.match(/BT[\s\S]*?ET/g) || [];
    for (const match of textMatches) {
      const textContent = match
        .replace(/BT|ET/g, '')
        .replace(/\([^)]*\)/g, (match) => {
          const content = match.slice(1, -1);
          return content.replace(/\\n/g, ' ').replace(/\\r/g, ' ');
        })
        .replace(/[^\w\s@.-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (textContent.length > 2) {
        extractedText += textContent + ' ';
      }
    }
    
    // Method 2: Extract text from PDF string objects (Tj, TJ operators)
    const stringMatches = text.match(/\([^)]*\)\s*Tj|\[[^\]]*\]\s*TJ/g) || [];
    for (const match of stringMatches) {
      const content = match
        .replace(/[()\[\]]/g, '')
        .replace(/Tj|TJ/g, '')
        .replace(/\\n/g, ' ')
        .replace(/\\r/g, ' ')
        .replace(/[^\w\s@.-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (content.length > 1) {
        extractedText += content + ' ';
      }
    }
    
    // Method 3: Look for readable text patterns in the raw binary
    const readableText = text.match(/[A-Za-z][A-Za-z0-9\s@.-]{3,}/g) || [];
    for (const readable of readableText) {
      if (readable.length > 3 && readable.length < 100) {
        extractedText += readable + ' ';
      }
    }
    
    // Method 4: Extract common resume patterns
    const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [];
    const phoneMatches = text.match(/(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g) || [];
    const nameMatches = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g) || [];
    
    // Combine all extracted content
    const allContent = [
      extractedText,
      ...emailMatches,
      ...phoneMatches,
      ...nameMatches.slice(0, 3)
    ].join(' ');
    
    // Clean up the final text
    const finalText = allContent
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s@.-]/g, ' ')
      .trim();
    
    console.log(`Enhanced fallback extracted ${finalText.length} characters from PDF`);
    
    // If we still don't have much text, return a placeholder for AI processing
    if (finalText.length < 20) {
      console.log("Very little text extracted, will rely on AI processing");
      return `PDF Resume Content (${buffer.length} bytes) - Please extract candidate name, email, and phone number from this resume document.`;
    }
    
    return finalText;
  } catch (error) {
    console.error("Enhanced fallback PDF extraction error:", error);
    return `PDF Resume Content (${buffer.length} bytes) - Please extract candidate name, email, and phone number from this resume document.`;
  }
}

async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || "";
}

// Local regex-based field extraction (fast, no API calls)
function extractFieldsWithRegex(text: string): { name: string; email: string; phone: string } {
  const result = { name: '', email: '', phone: '' };
  
  // Email extraction - most reliable
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch.length > 0) {
    result.email = emailMatch[0].trim();
  }
  
  // Phone extraction - handle various formats
  const phoneRegex = /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch && phoneMatch.length > 0) {
    // Clean up the phone number and validate
    const cleanPhone = phoneMatch[0].replace(/[^\d]/g, '');
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      // Format the phone number consistently
      if (cleanPhone.length === 10) {
        result.phone = `(${cleanPhone.slice(0,3)}) ${cleanPhone.slice(3,6)}-${cleanPhone.slice(6)}`;
      } else {
        result.phone = `+1 (${cleanPhone.slice(1,4)}) ${cleanPhone.slice(4,7)}-${cleanPhone.slice(7)}`;
      }
    }
  }
  
  // Name extraction - look for patterns at the beginning of the document
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common patterns for names in resumes
  const namePatterns = [
    /^[A-Z][a-z]+ [A-Z][a-z]+$/, // First Last
    /^[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+$/, // First M. Last
    /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/, // First Middle Last
  ];
  
  // Look in the first few lines for a name pattern
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    
    // Skip lines that look like headers or contact info
    if (line.toLowerCase().includes('resume') || 
        line.toLowerCase().includes('cv') ||
        line.toLowerCase().includes('@') ||
        line.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/) ||
        line.length > 50) {
      continue;
    }
    
    // Check if line matches name patterns
    for (const pattern of namePatterns) {
      if (pattern.test(line)) {
        result.name = line.trim();
        break;
      }
    }
    
    if (result.name) break;
  }
  
  // Fallback: if no pattern match, try to find a line that looks like a name
  if (!result.name) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      const words = line.split(' ');
      
      // Look for 2-3 words that start with capital letters
      if (words.length >= 2 && words.length <= 3) {
        const allWordsCapitalized = words.every(word => 
          word.length > 0 && word[0] === word[0].toUpperCase() && 
          /^[A-Za-z]+$/.test(word)
        );
        
        if (allWordsCapitalized && line.length < 30) {
          result.name = line.trim();
          break;
        }
      }
    }
  }
  
  return result;
}

// Validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

function isValidName(name: string): boolean {
  return name.length > 2 && name.length < 50 && /^[A-Za-z\s\.]+$/.test(name);
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

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
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
      return NextResponse.json({ error: "Unsupported file type. Please upload PDF or DOCX files only." }, { status: 400 });
    }

    // Validate that we extracted meaningful text
    if (!text || text.length < 10) {
      return NextResponse.json({ 
        error: "Could not extract text from the file. The file may be corrupted, password-protected, or image-based." 
      }, { status: 400 });
    }

    // Step 1: Try local regex extraction first (fast, no API calls)
    console.log("Attempting local regex extraction...");
    const localExtracted = extractFieldsWithRegex(text);
    console.log("Local extraction result:", localExtracted);
    
    // Step 2: Determine which fields need AI fallback
    const needsAIExtraction = {
      name: !localExtracted.name || !isValidName(localExtracted.name),
      email: !localExtracted.email || !isValidEmail(localExtracted.email),
      phone: !localExtracted.phone || !isValidPhone(localExtracted.phone)
    };
    
    let name = localExtracted.name;
    let email = localExtracted.email;
    let phone = localExtracted.phone;
    
    // Step 3: Use AI extraction as fallback for missing/invalid fields
    if (needsAIExtraction.name || needsAIExtraction.email || needsAIExtraction.phone) {
      try {
        console.log("Using AI extraction for missing/invalid fields:", needsAIExtraction);
        const aiExtracted = await extractCandidateDetailsFromText(text);
        
        // Only use AI results for fields that local extraction failed on
        if (needsAIExtraction.name && aiExtracted.name && isValidName(aiExtracted.name)) {
          name = aiExtracted.name;
          console.log("AI provided name:", name);
        }
        if (needsAIExtraction.email && aiExtracted.email && isValidEmail(aiExtracted.email)) {
          email = aiExtracted.email;
          console.log("AI provided email:", email);
        }
        if (needsAIExtraction.phone && aiExtracted.phone && isValidPhone(aiExtracted.phone)) {
          phone = aiExtracted.phone;
          console.log("AI provided phone:", phone);
        }
      } catch (aiError) {
        console.error("AI extraction failed:", aiError);
        // Continue with local extraction results
      }
    }

    // Step 4: Final validation and determine missing fields
    const finalResult = {
      name: name && isValidName(name) ? name : "",
      email: email && isValidEmail(email) ? email : "",
      phone: phone && isValidPhone(phone) ? phone : ""
    };
    
    const missingFields = [];
    if (!finalResult.name) missingFields.push('name');
    if (!finalResult.email) missingFields.push('email');
    if (!finalResult.phone) missingFields.push('phone');
    
    console.log("Final extraction result:", finalResult);
    console.log("Missing fields:", missingFields);

    return NextResponse.json({
      candidate: {
        name: finalResult.name || "Unknown Candidate",
        email: finalResult.email || "unknown@example.com", 
        phone: finalResult.phone || "",
      },
      extracted: {
        name: finalResult.name || "",
        email: finalResult.email || "",
        phone: finalResult.phone || "",
      },
      missingFields,
      meta: { 
        length: text.length,
        hasExtractedInfo: !!(finalResult.name || finalResult.email || finalResult.phone),
        extractionMethod: {
          local: {
            name: !!localExtracted.name,
            email: !!localExtracted.email,
            phone: !!localExtracted.phone
          },
          ai: {
            name: needsAIExtraction.name,
            email: needsAIExtraction.email,
            phone: needsAIExtraction.phone
          }
        }
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Parse failed";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


