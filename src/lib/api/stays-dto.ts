/**
 * Stable UI/API DTOs for Duffel Stays — do not expose raw Duffel JSON to the client.
 */

export type StaysSearchResultCard = {
  search_result_id: string;
  accommodation_id: string;
  name: string;
  address_line: string | null;
  city: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  /** Cheapest total for stay (major units string) */
  total_amount: string | null;
  total_currency: string | null;
  /** Nightly-style hint when total unknown */
  nightly_from_amount: string | null;
  nightly_from_currency: string | null;
  review_score: number | null;
  rating_stars: number | null;
  photo_url: string | null;
};

/** One entry from Duffel `cancellation_timeline` on a rate ([guide](https://duffel.com/docs/guides/displaying-the-cancellation-timeline)). */
export type StaysCancellationStep = {
  before: string;
  refund_amount: string;
  currency: string | null;
};

export type StaysRateCondition = {
  title: string;
  description: string | null;
};

export type StaysRateRow = {
  rate_id: string;
  room_name: string;
  board_type: string | null;
  total_amount: string;
  total_currency: string;
  base_amount: string | null;
  base_currency: string | null;
  description: string | null;
  payment_type: string | null;
  room_image_url: string | null;
  cancellation_timeline: StaysCancellationStep[];
  negotiated_rate_id: string | null;
  rate_code: string | null;
  supported_loyalty_programme: string | null;
  conditions: StaysRateCondition[];
};

export type StaysRatesPayload = {
  search_result_id: string;
  accommodation: {
    id: string;
    name: string;
    description: string | null;
    review_score: number | null;
    rating: number | null;
    phone_number: string | null;
    email: string | null;
    location: {
      latitude: number | null;
      longitude: number | null;
      line_one: string | null;
      city: string | null;
      region: string | null;
      postal_code: string | null;
      country_code: string | null;
    };
    photos: string[];
    amenities: { type: string; description: string | null }[];
    check_in_after_time: string | null;
    check_out_before_time: string | null;
  };
  rates: StaysRateRow[];
};

export type StaysQuoteDto = {
  quote_id: string;
  rate_id: string | null;
  expires_at: string | null;
  total_amount: string | null;
  total_currency: string | null;
  due_at_accommodation_amount: string | null;
  due_at_accommodation_currency: string | null;
};
