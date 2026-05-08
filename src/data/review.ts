export interface Review {
  text: string;
  name: string;
  role: string;
  image: string;
}

export const REVIEWS: Review[] = [
  {
    name: "Maria Smantha",
    role: "Web Developer",
    text: "TravelTourUp made booking my vacation incredibly easy. I found the perfect hotel within minutes and the booking process was smooth from start to finish. Everything was exactly as described and the prices were better than other platforms I checked.",
    image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(1).webp",
  },
  {
    name: "Lisa Cudrow",
    role: "Graphic Designer",
    text: "I love how simple and clean the platform is. I was able to compare multiple hotels and flights without any confusion. The deals were amazing and the customer support team was very helpful when I had questions about my booking.",
    image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(2).webp",
  },
  {
    name: "John Smith",
    role: "Marketing Specialist",
    text: "Booking my trip through TravelTourUp was a fantastic experience. From finding affordable flights to reserving a comfortable hotel, everything was handled perfectly. I’ll definitely be using this platform again for my future travels.",
    image: "https://mdbcdn.b-cdn.net/img/Photos/Avatars/img%20(9).webp",
  },
];