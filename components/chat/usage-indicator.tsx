"use client";

import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import useSWR from "swr";
import type { UsageResponse } from "@/app/(chat)/api/usage/route";

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to fetch usage");
    }
    return response.json() as Promise<UsageResponse>;
  });

type UsageIndicatorProps = {
  refreshKey?: number;
};

export function UsageIndicator({ refreshKey }: UsageIndicatorProps) {
  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/usage`;
  const { data, mutate } = useSWR<UsageResponse>(apiUrl, fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 0,
  });

  useEffect(() => {
    mutate();
  }, [mutate, refreshKey]);

  if (!data?.isGuest) {
    return null;
  }

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-xl border border-red-400/30 bg-red-500/5 px-3 py-2 text-[12px] text-foreground/85">
      <span className="flex items-center gap-2">
        <SparklesIcon className="size-3.5 text-red-400" />
        <span>
          <span className="font-medium text-foreground">Guest mode</span>
          <span className="mx-1.5 text-muted-foreground/60">·</span>
          <span>
            {data.remaining} of {data.limit} free messages left
          </span>
        </span>
      </span>
      <Link
        className="rounded-md bg-red-500 px-2.5 py-1 font-medium text-white transition-colors hover:bg-red-400"
        href="/login"
      >
        Sign in
      </Link>
    </div>
  );
}
