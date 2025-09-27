"use client";
import React from "react";
import { Card, Empty, Table, Typography, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector } from "react-redux";
import { selectCandidates } from "@/store";

type CandidateRow = {
    id: string;
    name: string;
    email: string;
    phone: string;
    score: number;
    status: "not_started" | "in_progress" | "completed";
};

export default function DashboardPage() {
    const items = useSelector(selectCandidates);
    const columns: ColumnsType<CandidateRow> = [
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Phone", dataIndex: "phone", key: "phone" },
        {
            title: "Final Score",
            dataIndex: "score",
            key: "score",
            sorter: (a, b) => a.score - b.score,
            render: (value: number) => <span>{value.toFixed(1)}</span>,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status: CandidateRow["status"]) => {
                const color = status === "completed" ? "green" : status === "in_progress" ? "blue" : "default";
                const label = status === "not_started" ? "Not Started" : status === "in_progress" ? "In Progress" : "Completed";
                return <Tag color={color}>{label}</Tag>;
            },
            filters: [
                { text: "Not Started", value: "not_started" },
                { text: "In Progress", value: "in_progress" },
                { text: "Completed", value: "completed" },
            ],
            onFilter: (value, record) => record.status === value,
        },
    ];

    const data: CandidateRow[] = items as CandidateRow[];

    return (
        <div className="p-6 max-w-6xl mx-auto w-full bg-white/80 backdrop-blur-sm rounded-2xl border border-purple-200 shadow-sm">
            <Typography.Title level={3} className="!mb-1 !text-purple-700">Interviewer Dashboard</Typography.Title>
            <Typography.Paragraph type="secondary">
                Track candidates, scores, and statuses. Data will appear here once added.
            </Typography.Paragraph>
            <Card className="mt-2" bordered>
                <Table
                    className="mt-2"
                    columns={columns}
                    dataSource={data}
                    rowKey={(r) => r.id || r.email}
                    bordered
                    size="small"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                    sticky
                    scroll={{ x: true }}
                    locale={{ emptyText: <Empty description="No candidates yet" /> }}
                />
            </Card>
        </div>
    );
}


