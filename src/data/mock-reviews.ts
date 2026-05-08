/** Category score for rating breakdown */
export interface CategoryScore {
  name: string;
  score: number;
  color?: string;
}

/** Reply to a review (no rating) */
export interface MockReviewReply {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  date: string;
}

/** Generic review for detail page ReviewsSection */
export interface MockReview {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  likes?: number;
  dislikes?: number;
  hearts?: number;
  replies?: MockReviewReply[];
}

/** Default avatar URLs for reviews */
const AVATARS = [
  "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(1).webp",
  "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(2).webp",
  "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(9).webp",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=1",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=2",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=3",
];

/** Mock reviews keyed by item id (flight, hotel, car) */
export const MOCK_REVIEWS: Record<string, MockReview[]> = {
  "1": [
    {
      id: "r1",
      author: "Ahmed K.",
      avatar: AVATARS[0],
      rating: 5,
      date: "April 5, 2019",
      text: "Excellent flight! On time, comfortable seats, and the crew was very professional. Would definitely fly again.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
    },
    {
      id: "r2",
      author: "Sarah M.",
      avatar: AVATARS[1],
      rating: 4,
      date: "April 3, 2019",
      text: "Good value for money. The only minor issue was a slight delay at boarding, but overall a smooth experience.",
      likes: 8,
      dislikes: 1,
      hearts: 3,
    },
    {
      id: "r3",
      author: "John D.",
      avatar: AVATARS[2],
      rating: 5,
      date: "March 28, 2019",
      text: "Best flight I've taken on this route. Clean cabin, good meals, and excellent service.",
      likes: 15,
      dislikes: 0,
      hearts: 7,
    },
    {
      id: "r3b",
      author: "Jenny Doe",
      avatar: AVATARS[3],
      rating: 5,
      date: "April 5, 2019",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
    },
  ],
  "2": [
    {
      id: "r4",
      author: "Maria L.",
      avatar: AVATARS[4],
      rating: 4,
      date: "2026-03-12",
      text: "Comfortable journey with one stop. The layover was well organized. Would recommend.",
      likes: 10,
      dislikes: 1,
      hearts: 4,
    },
  ],
  "3": [
    {
      id: "r5",
      author: "Omar H.",
      avatar: AVATARS[5],
      rating: 5,
      date: "2026-03-18",
      text: "Premium experience from start to finish. Emirates never disappoints.",
      likes: 20,
      dislikes: 0,
      hearts: 12,
    },
  ],
};

// Hotel reviews (same keys 1, 2, 3... for hotel ids)
export const MOCK_HOTEL_REVIEWS: Record<string, MockReview[]> = {
  "1": [
    {
      id: "hr1",
      author: "Emma W.",
      avatar: AVATARS[0],
      rating: 5,
      date: "April 5, 2019",
      text: "Stunning beachfront property. The spa was incredible and the breakfast buffet was top-notch. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
      replies: [
        {
          id: "hr1-r1",
          author: "Hotel Manager",
          text: "Thank you for your kind words, Emma! We're thrilled you enjoyed your stay. We hope to welcome you back soon.",
          date: "April 6, 2019",
        },
      ],
    },
    {
      id: "hr2",
      author: "David R.",
      avatar: AVATARS[1],
      rating: 4,
      date: "April 3, 2019",
      text: "Great location and friendly staff. Room was clean and comfortable. Would stay again.",
      likes: 8,
      dislikes: 1,
      hearts: 3,
    },
    {
      id: "hr2b",
      author: "Jenny Doe",
      avatar: AVATARS[2],
      rating: 5,
      date: "April 5, 2019",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
    },
  ],
  "2": [
    {
      id: "hr3",
      author: "Lisa K.",
      avatar: AVATARS[3],
      rating: 5,
      date: "2026-03-16",
      text: "Perfect for business travel. Fast WiFi and excellent conference facilities.",
      likes: 12,
      dislikes: 0,
      hearts: 6,
    },
  ],
};

// Car reviews
export const MOCK_CAR_REVIEWS: Record<string, MockReview[]> = {
  "1": [
    {
      id: "cr1",
      author: "Mike T.",
      avatar: AVATARS[0],
      rating: 5,
      date: "April 5, 2019",
      text: "Smooth pickup at the airport. Car was clean and exactly as described. Great value. Lorem ipsum dolor sit amet.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
    },
    {
      id: "cr2",
      author: "Anna P.",
      avatar: AVATARS[1],
      rating: 4,
      date: "April 3, 2019",
      text: "Reliable car, no issues. The unlimited mileage was a big plus for our road trip.",
      likes: 8,
      dislikes: 1,
      hearts: 3,
    },
    {
      id: "cr2b",
      author: "Jenny Doe",
      avatar: AVATARS[2],
      rating: 5,
      date: "April 5, 2019",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      likes: 13,
      dislikes: 2,
      hearts: 5,
    },
  ],
  "2": [
    {
      id: "cr3",
      author: "James L.",
      avatar: AVATARS[4],
      rating: 5,
      date: "2026-03-18",
      text: "Excellent service from Hertz. Car was in perfect condition.",
      likes: 15,
      dislikes: 0,
      hearts: 8,
    },
  ],
};

/** Default category scores for hotels */
export const DEFAULT_HOTEL_CATEGORIES: CategoryScore[] = [
  { name: "Service", score: 4.6, color: "bg-blue-500" },
  { name: "Location", score: 4.7, color: "bg-emerald-500" },
  { name: "Value for Money", score: 2.6, color: "bg-amber-500" },
  { name: "Cleanliness", score: 3.6, color: "bg-violet-500" },
  { name: "Facilities", score: 2.6, color: "bg-rose-500" },
];

/** Default category scores for cars */
export const DEFAULT_CAR_CATEGORIES: CategoryScore[] = [
  { name: "Condition", score: 4.8, color: "bg-blue-500" },
  { name: "Value", score: 4.5, color: "bg-emerald-500" },
  { name: "Pickup Experience", score: 4.6, color: "bg-violet-500" },
  { name: "Cleanliness", score: 4.7, color: "bg-amber-500" },
  { name: "Customer Service", score: 4.4, color: "bg-rose-500" },
];

/** Default category scores for flights */
export const DEFAULT_FLIGHT_CATEGORIES: CategoryScore[] = [
  { name: "Comfort", score: 4.5, color: "bg-blue-500" },
  { name: "Crew", score: 4.7, color: "bg-emerald-500" },
  { name: "Value", score: 4.2, color: "bg-violet-500" },
  { name: "Punctuality", score: 4.8, color: "bg-amber-500" },
  { name: "Food & Beverage", score: 4.3, color: "bg-rose-500" },
];

/** Get reviews for an item by type and id */
export function getReviewsForItem(
  itemId: string | number,
  type?: "flight" | "hotel" | "car"
): MockReview[] {
  const key = String(itemId);
  if (type === "hotel") return MOCK_HOTEL_REVIEWS[key] ?? MOCK_REVIEWS["1"] ?? [];
  if (type === "car") return MOCK_CAR_REVIEWS[key] ?? MOCK_REVIEWS["1"] ?? [];
  return MOCK_REVIEWS[key] ?? MOCK_REVIEWS["1"] ?? [];
}

/** Get category scores for an item by type */
export function getCategoryScoresForItem(
  type?: "flight" | "hotel" | "car"
): CategoryScore[] {
  if (type === "hotel") return DEFAULT_HOTEL_CATEGORIES;
  if (type === "car") return DEFAULT_CAR_CATEGORIES;
  return DEFAULT_FLIGHT_CATEGORIES;
}
