"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Upload, FileText, CheckCircle, AlertCircle, User, Mail, Phone } from "lucide-react";
import type { Candidate } from "@/store";

interface ResumeUploadProps {
    onResumeProcessed?: (candidate: Candidate) => void;
}

export default function ResumeUpload({ onResumeProcessed }: ResumeUploadProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [extractedInfo, setExtractedInfo] = useState<Partial<Candidate> & { missingFields?: string[] } | null>(null);
    const dispatch = useDispatch();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const isPdf = file.type === "application/pdf";
        const isDocx = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        if (!isPdf && !isDocx) {
            setError("Invalid file. Please upload a PDF or DOCX file.");
            return;
        }

        setFileName(file.name);
        setError(null);
        void handleParse(file);
    };

    async function handleParse(file: File) {
        try {
            setLoading(true);
            setError(null);
            const form = new FormData();
            form.append("file", file);
            const res = await fetch("/api/parse-resume", { method: "POST", body: form });
            if (!res.ok) throw new Error(`Parse failed (${res.status})`);
            const json = await res.json();

            // Use the extracted information (empty strings for missing fields)
            const extracted = json.extracted || {};
            const candidate: Candidate = {
                id: crypto.randomUUID(),
                name: extracted.name || "Unknown Candidate",
                email: extracted.email || "unknown@example.com",
                phone: extracted.phone || "",
                score: 0,
                status: "not_started",
            };

            // Store the extracted info for display
            setExtractedInfo({
                name: extracted.name,
                email: extracted.email,
                phone: extracted.phone,
                missingFields: json.missingFields || []
            });

            dispatch({ type: "candidates/add", payload: candidate });
            setSuccess(true);

            // Wait 2 seconds to show the extracted data, then trigger interview flow
            setTimeout(() => {
                if (onResumeProcessed) {
                    onResumeProcessed(candidate);
                }
            }, 2000);
        } catch (e) {
            const err = e as Error;
            setError(err?.message || "Failed to parse resume");
        } finally {
            setLoading(false);
        }
    }

    const resetUpload = () => {
        setFileName(null);
        setError(null);
        setSuccess(false);
        setExtractedInfo(null);
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-xl shadow-slate-900/10">
                <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-2xl mb-4">
                        <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Upload Your Resume</h3>
                    <p className="text-slate-600">Upload your resume in PDF or DOCX format to start your interview</p>
                </div>

                {!success ? (
                    <div className="space-y-4">
                        <label className="block">
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileSelect}
                                disabled={loading}
                                className="hidden"
                            />
                            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 cursor-pointer">
                                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <p className="text-lg font-semibold text-slate-700 mb-2">
                                    {loading ? "Processing..." : "Click to select file"}
                                </p>
                                <p className="text-sm text-slate-500">PDF or DOCX files only</p>
                            </div>
                        </label>

                        {fileName && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-slate-100 rounded-lg">
                                <FileText className="w-5 h-5 text-slate-600" />
                                <span className="text-slate-700 font-medium">{fileName}</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <span className="text-red-700">{error}</span>
                            </div>
                        )}

                        {loading && (
                            <div className="flex items-center justify-center gap-2 p-4">
                                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
                                <span className="text-slate-600">Extracting information from resume...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-green-700 font-medium">Resume uploaded successfully!</span>
                        </div>

                        {/* Extracted Information */}
                        {extractedInfo && (
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <h4 className="text-lg font-semibold text-slate-900 mb-4">Resume Analysis</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="w-5 h-5 text-slate-600" />
                                        <span className="text-slate-700">
                                            <strong>Name:</strong> {extractedInfo.name || "Not found"}
                                            {extractedInfo.name && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-slate-600" />
                                        <span className="text-slate-700">
                                            <strong>Email:</strong> {extractedInfo.email || "Not found"}
                                            {extractedInfo.email && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-slate-600" />
                                        <span className="text-slate-700">
                                            <strong>Phone:</strong> {extractedInfo.phone || "Not found"}
                                            {extractedInfo.phone && <CheckCircle className="w-4 h-4 text-green-500 inline ml-2" />}
                                        </span>
                                    </div>
                                </div>

                                {/* Missing Information Notice */}
                                {extractedInfo?.missingFields && extractedInfo.missingFields.length > 0 && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-5 h-5 text-blue-600" />
                                            <span className="text-blue-800 font-medium">Information Collection Needed</span>
                                        </div>
                                        <p className="text-blue-700 text-sm">
                                            The chatbot will now collect your {extractedInfo.missingFields.join(', ')} before starting the interview.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={resetUpload}
                            className="w-full px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200"
                        >
                            Upload Different Resume
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


