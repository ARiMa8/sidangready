"use client";

import { useMemo, useState } from "react";
import { Clock3, Mic2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDuration } from "@/lib/format";
import type { PresentationScriptSlide } from "@/types";

export function PresentationScriptPanel({
  slides,
  targetMinutes,
}: {
  slides: PresentationScriptSlide[];
  targetMinutes: number;
}) {
  const orderedSlides = useMemo(
    () => [...slides].sort((a, b) => a.slideNumber - b.slideNumber),
    [slides],
  );
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  const activeSlide =
    orderedSlides.find((slide) => slide.id === activeSlideId) ?? orderedSlides[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Card>
        <CardHeader className="border-b border-border">
          <CardTitle>Daftar Slide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-3">
          {orderedSlides.map((slide) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveSlideId(slide.id)}
              className={`rounded-md border p-3 ${
                slide.id === activeSlide.id
                  ? "border-indigo-500/50 bg-indigo-500/10"
                  : "border-border bg-slate-950/40"
              } w-full text-left transition hover:border-indigo-500/40 hover:bg-indigo-500/5`}
            >
              <p className="text-xs text-slate-500">Slide {slide.slideNumber}</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-100">
                {slide.slideTitle}
              </p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                Slide {activeSlide.slideNumber} - {activeSlide.slideTitle}
              </CardTitle>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                <Clock3 className="h-4 w-4" />
                Estimasi {formatDuration(activeSlide.estimatedDurationSeconds)}
              </p>
            </div>
            <StatusBadge tone="indigo">Standar {targetMinutes} Menit</StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="rounded-lg border border-border bg-slate-950/45 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-300">
              <Mic2 className="h-4 w-4" />
              Script presenter
            </div>
            <p className="text-sm leading-7 text-slate-300">{activeSlide.scriptText}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-100">Poin penting</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {activeSlide.keyPoints.map((point) => (
                  <li key={point} className="rounded-md bg-slate-950/45 px-3 py-2">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">Delivery tips</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {activeSlide.deliveryTips.map((tip) => (
                  <li key={tip} className="rounded-md bg-slate-950/45 px-3 py-2">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
