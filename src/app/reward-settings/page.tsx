"use client";

import { useState } from "react";
import { useAppContext } from "@/contexts/AppContext";
import { RewardForm } from "@/components/reward/RewardForm";
import { RewardList } from "@/components/reward/RewardList";
import { PatternForm } from "@/components/reward/PatternForm";
import { PatternList } from "@/components/reward/PatternList";
import { cn } from "@/lib/utils";

export default function RewardSettingPage() {
    const { notionSettings, saveNotionSettings, isDbReady } = useAppContext();
    const [apiKey, setApiKey] = useState(notionSettings.api_key);
    const [pageId, setPageId] = useState(notionSettings.page_id);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleSaveNotion = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await saveNotionSettings({ api_key: apiKey, page_id: pageId });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        
    );
}
