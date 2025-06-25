"use client"

import { Button } from "@/components/ui/button"
import { PopoverContent } from "@/components/ui/popover"
import Image from "next/image"
import React, { useState } from "react"
import Link from "next/link"
import { APP_NAME } from "../../../lib/config"
import { createClient } from "../../../lib/supabase/client"
import { isSupabaseEnabled } from "../../../lib/supabase/config"

export function PopoverContentAuth() {
  if (!isSupabaseEnabled) {
    return null
  }
  return (
    <PopoverContent
      className="w-[300px] overflow-hidden rounded-xl p-0"
      side="top"
      align="start"
    >
      <Image
        src="/banner_forest.jpg"
        alt={`calm paint generate by ${APP_NAME}`}
        width={300}
        height={128}
        className="h-32 w-full object-cover"
      />
      <div className="p-3">
        <p className="text-primary mb-1 text-base font-medium">
          Login to try more features for free
        </p>
        <p className="text-muted-foreground mb-5 text-base">
          Add files, use more models, BYOK, and more.
        </p>
        <Link href="/auth">
          <Button
            variant="default"
            className="w-full text-base"
            size="lg"
          >
            Sign In / Sign Up
          </Button>
        </Link>
      </div>
    </PopoverContent>
  )
}
