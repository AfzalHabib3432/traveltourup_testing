"use client";

import React, { useState, useCallback } from "react";
import {
  Star,
  Reply,
  ThumbsUp,
  ThumbsDown,
  Heart,
} from "lucide-react";
import type {
  MockReview,
  MockReviewReply,
  CategoryScore,
} from "@/data/mock-reviews";
import {
  getReviewsForItem,
  getCategoryScoresForItem,
} from "@/data/mock-reviews";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const INITIAL_DISPLAY_COUNT = 3;
const LOAD_MORE_COUNT = 3;

function getRatingLabel(rating: number): string {
  if (rating >= 4.5) return "Excellent";
  if (rating >= 4) return "Very Good";
  if (rating >= 3) return "Good";
  if (rating >= 2) return "Fair";
  return "Poor";
}

/** Duffel Stays / supplier guest score is typically 0–10 (e.g. 9.6 → Exceptional). */
function getDuffelGuestScoreLabel(score: number): string {
  if (score >= 9.4) return "Exceptional";
  if (score >= 8.8) return "Excellent";
  if (score >= 8.0) return "Very good";
  if (score >= 7.0) return "Good";
  if (score >= 6.0) return "Pleasant";
  return "Fair";
}

function clampOfficialStarRating(n: number): number {
  return Math.max(1, Math.min(5, Math.round(Number.isFinite(n) ? n : 0) || 0));
}

export type StaysProviderSummary = {
  displayName: string;
  starRating: number;
  guestScore: number | null;
  locationLine: string;
};

export interface ReviewsSectionProps {
  itemId: string | number;
  rating: number;
  reviews?: MockReview[];
  categoryScores?: CategoryScore[];
  itemType?: "flight" | "hotel" | "car";
  /** When set (Duffel Stays), shows supplier property name, official stars, guest score /10, and location above the reviews list. */
  staysProviderSummary?: StaysProviderSummary;
}

/**
 * Generic reviews and ratings section for detail pages.
 * Displays rating summary card, category scores, and guest reviews with reply and load more.
 */
export function ReviewsSection({
  itemId,
  rating,
  reviews: reviewsProp,
  categoryScores: categoryScoresProp,
  itemType,
  staysProviderSummary,
}: ReviewsSectionProps) {
  const allReviews =
    reviewsProp ?? getReviewsForItem(itemId, itemType);
  const categoryScores =
    categoryScoresProp ?? getCategoryScoresForItem(itemType);

  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const [localReviews, setLocalReviews] = useState<MockReview[]>(allReviews);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyText, setReplyText] = useState("");
  const [userReactions, setUserReactions] = useState<
    Record<string, { liked?: boolean; disliked?: boolean; loved?: boolean }>
  >({});

  const displayedReviews = localReviews.slice(0, displayCount);
  const hasMore = displayCount < localReviews.length;

  const handleLoadMore = useCallback(() => {
    setDisplayCount((c) => Math.min(c + LOAD_MORE_COUNT, localReviews.length));
  }, [localReviews.length]);

  const handleReplyClick = useCallback((reviewId: string) => {
    setReplyingToId((prev) => (prev === reviewId ? null : reviewId));
    setReplyName("");
    setReplyText("");
  }, []);

  const handleReaction = useCallback(
    (
      reviewId: string,
      type: "liked" | "disliked" | "loved"
    ) => {
      setUserReactions((prev) => {
        const current = prev[reviewId] ?? {};
        const toggled = !current[type];
        if (type === "disliked") {
          return {
            ...prev,
            [reviewId]: toggled
              ? { disliked: true, liked: false, loved: false }
              : { ...current, disliked: false },
          };
        }
        return {
          ...prev,
          [reviewId]: toggled
            ? { ...current, [type]: true, disliked: false }
            : { ...current, [type]: false },
        };
      });
    },
    []
  );

  const getDisplayCount = useCallback(
    (
      review: MockReview,
      type: "likes" | "dislikes" | "hearts"
    ): number => {
      const key = type === "hearts" ? "loved" : type === "likes" ? "liked" : "disliked";
      const base = review[type] ?? 0;
      const userAdded = userReactions[review.id]?.[key] ? 1 : 0;
      return base + userAdded;
    },
    [userReactions]
  );

  const handleReplySubmit = useCallback(
    (reviewId: string) => {
      if (!replyName.trim() || !replyText.trim()) return;
      const newReply: MockReviewReply = {
        id: `reply-${Date.now()}`,
        author: replyName.trim(),
        text: replyText.trim(),
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
      setLocalReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                replies: [...(r.replies ?? []), newReply],
              }
            : r
        )
      );
      setReplyingToId(null);
      setReplyName("");
      setReplyText("");
    },
    [replyName, replyText]
  );

  const roundedRating = Math.round(rating * 10) / 10;
  const officialStars = staysProviderSummary
    ? clampOfficialStarRating(staysProviderSummary.starRating)
    : null;
  const duffelGuestScore = staysProviderSummary?.guestScore;

  return (
    <section aria-labelledby="reviews-heading">
   
      {staysProviderSummary ? (
        <div className="mb-8 rounded-xl border border-border bg-card p-6 shadow-sm">
             <h2
        id="reviews-heading"
        className="text-2xl font-bold text-foreground mb-4"
      >
        Reviews
      </h2>
          <p className="text-2xl font-bold text-foreground">
            {staysProviderSummary.displayName}
          </p>
          <div
            className="mt-3 flex flex-wrap items-center justify-between gap-2"
            aria-label={`${officialStars}-star hotel`}
          >
            <div className="flex" aria-hidden>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    officialStars != null && star <= officialStars
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground/35"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              ({officialStars}-star hotel)
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">

          {duffelGuestScore != null && Number.isFinite(duffelGuestScore) ? (
            <p className="mt-3 text-lg font-semibold text-foreground">
              <span className="text-primary mr-2">{duffelGuestScore.toFixed(1)}</span>{" "}
              {getDuffelGuestScoreLabel(duffelGuestScore)}
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Guest score not provided</p>
          )}
          <p className="mt-1 text-base text-muted-foreground">
            {staysProviderSummary.locationLine}
          </p>
          </div>
        </div>
      ) : null}

      

    
    </section>
  );
}
