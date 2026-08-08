export type ManualPublicationReview = {
  technicalReviewedAt?: Date | string | null;
  technicalReviewer?: string | null;
  marketingReviewedAt?: Date | string | null;
  marketingReviewer?: string | null;
};

export type PublicationValidation = {
  canPublish: boolean;
  missing: string[];
};

/** Manual publication requires a named technical and marketing review. */
export function validateManualPublication(review: ManualPublicationReview): PublicationValidation {
  const missing: string[] = [];

  if (!review.technicalReviewedAt || !review.technicalReviewer?.trim()) {
    missing.push("technical review");
  }

  if (!review.marketingReviewedAt || !review.marketingReviewer?.trim()) {
    missing.push("marketing review");
  }

  return { canPublish: missing.length === 0, missing };
}
