"use client";

import { Button } from "@/shared/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PrevLinkProps = {
  url?: string
}

export const PrevLink = ({
  url
}: PrevLinkProps) => {
  const router = useRouter();
  return !url ? <Button className="w-fit px-4" variant="secondary" onClick={() => router.back()}>
    <ArrowLeft></ArrowLeft>
  </Button> : <Link href={url}>
    <Button className="w-fit px-4" variant="secondary">
      <ArrowLeft></ArrowLeft>
    </Button>
  </Link>
};
