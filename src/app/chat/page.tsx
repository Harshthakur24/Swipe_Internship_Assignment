"use client";
import React from "react";
import { Card, Typography } from "antd";
import ResumeUpload from "@/components/ResumeUpload";

export default function ChatPage() {
    return (
        <div className="p-6 max-w-5xl mx-auto w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 shadow-sm">
            <Typography.Title level={3} className="!mb-1 !text-purple-700">Chat Interview</Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-4">
                Start by uploading a resume. We’ll parse details to kick off the interview.
            </Typography.Paragraph>
            <Card className="mt-2" bordered>
                <ResumeUpload />
            </Card>
        </div>
    );
}


