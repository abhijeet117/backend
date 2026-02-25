const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80";

const makeLikes = (seed) => [
  "rahul",
  "aesthetic_eats",
  "daily.designs",
  "culinary_canvas",
  "minimalist.living",
  "travel_gram",
  "tech_trends",
  "urban_jungle",
  "fitness_freak",
  "foodie_fran",
  "style_icon",
  "flavor_hunter",
  "coffee_culture",
  "pixel.monk",
  "wanderlust_eats",
  "sunny.shots",
].map((name, index) => `${name}${index % 3 === 0 ? seed : ""}`);

export const mockFeedPosts = [
  {
    id: "mock-1",
    user: {
      userName: "Aesthetic_Eats",
      profileImg:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
      location: "New York, NY",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1200&q=80",
    caption:
      "Indulging in the art of flavor. This burrata plate is a masterpiece. #Foodie #Gourmet #FineDining",
    comments: [
      {
        id: "mock-1-c1",
        userName: "culinary_canvas",
        text: "Looks absolutely stunning! Need to try this.",
      },
      {
        id: "mock-1-c2",
        userName: "flavor_hunter",
        text: "That balsamic drizzle though...",
      },
      {
        id: "mock-1-c3",
        userName: "foodie_fran",
        text: "Instantly made me hungry.",
      },
    ],
    likedBy: makeLikes("1"),
    createdAt: "2026-02-25T08:15:00.000Z",
  },
  {
    id: "mock-2",
    user: {
      userName: "culinary_canvas",
      profileImg:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
      location: "London, UK",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    caption:
      "Brunch done right. Avocado toast, poached eggs, and flower garnish for the perfect frame. #BrunchGoals #FoodPhotography",
    comments: [
      {
        id: "mock-2-c1",
        userName: "foodie_fran",
        text: "The colors are insane in this shot.",
      },
      {
        id: "mock-2-c2",
        userName: "breakfast_club",
        text: "Need this ASAP!",
      },
      {
        id: "mock-2-c3",
        userName: "rahul",
        text: "Saved this for weekend plans.",
      },
    ],
    likedBy: makeLikes("2"),
    createdAt: "2026-02-24T17:40:00.000Z",
  },
  {
    id: "mock-3",
    user: {
      userName: "minimalist.living",
      profileImg:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
      location: "Stockholm, Sweden",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
    caption:
      "Simplifying the workspace for maximum focus. #Minimalism #DeskSetup #Productivity",
    comments: [
      {
        id: "mock-3-c1",
        userName: "design_lover",
        text: "Love this vibe. So clean.",
      },
      {
        id: "mock-3-c2",
        userName: "tech_enthusiast",
        text: "Where is that desk from?",
      },
      {
        id: "mock-3-c3",
        userName: "pixel.monk",
        text: "Perfect lighting and framing.",
      },
    ],
    likedBy: makeLikes("3"),
    createdAt: "2026-02-24T14:10:00.000Z",
  },
  {
    id: "mock-4",
    user: {
      userName: "apex.apparel",
      profileImg:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      location: "Toronto, Canada",
    },
    imageUrl:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=1200&q=80",
    caption:
      "New urban collection dropping this Friday. Streetwear meets comfort. #Fashion #NewArrivals #Streetwear",
    comments: [
      {
        id: "mock-4-c1",
        userName: "style_icon",
        text: "Can't wait to shop this drop!",
      },
      {
        id: "mock-4-c2",
        userName: "urban_jungle",
        text: "Color palette is on point.",
      },
      {
        id: "mock-4-c3",
        userName: "rahul",
        text: "This fit is fire.",
      },
    ],
    likedBy: makeLikes("4"),
    createdAt: "2026-02-23T20:30:00.000Z",
  },
];

export const mockStories = [
  {
    id: "story-own",
    userName: "Your story",
    profileImg: DEFAULT_AVATAR,
    isOwn: true,
  },
  {
    id: "story-1",
    userName: "wanderlust_eats",
    profileImg:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "story-2",
    userName: "daily.designs",
    profileImg:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "story-3",
    userName: "coffee_culture",
    profileImg:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "story-4",
    userName: "travel_gram",
    profileImg:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "story-5",
    userName: "tech_trends",
    profileImg:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
];
