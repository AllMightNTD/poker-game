export const currentUser = {
  id: "me",
  name: "You",
  avatar:
    "https://api.dicebear.com/7.x/avataaars/svg?seed=me&backgroundColor=b6e3f4",
};

export const stories = [
  {
    id: "1",
    user: "Victor Exrixon",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=victor&backgroundColor=ffdfbf",
    image: "https://picsum.photos/seed/story1/120/200",
    hasNew: true,
  },
  {
    id: "2",
    user: "Surfiya Zakir",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=surfiya&backgroundColor=c0aede",
    image: "https://picsum.photos/seed/story2/120/200",
    hasNew: true,
  },
  {
    id: "3",
    user: "Gorla Coast",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=gorla&backgroundColor=d1d4f9",
    image: "https://picsum.photos/seed/story3/120/200",
    hasNew: false,
  },
  {
    id: "4",
    user: "Hurin Seary",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=hurin&backgroundColor=ffd5dc",
    image: "https://picsum.photos/seed/story4/120/200",
    hasNew: true,
  },
];

export const posts = [
  {
    id: "1",
    user: {
      name: "Surfiya Zakir",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=surfiya&backgroundColor=c0aede",
    },
    time: "3 hours ago",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nulla dolor, ornare at commodo non, feugiat non nisi. Phasellus faucibus mollis pharetra. Proin blandit ac massa sed rhoncus.",
    images: [
      "https://picsum.photos/seed/post1a/400/300",
      "https://picsum.photos/seed/post1b/400/300",
      "https://picsum.photos/seed/post1c/400/300",
    ],
    likes: 2800,
    comments: 22,
    shares: 4,
  },
  {
    id: "2",
    user: {
      name: "Anthony Daugloi",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=anthony&backgroundColor=b6e3f4",
    },
    time: "5 hours ago",
    content:
      "Just had an amazing experience hiking today! The views were absolutely breathtaking. Nature never ceases to amaze me 🏔️",
    images: ["https://picsum.photos/seed/post2/800/400"],
    likes: 1240,
    comments: 56,
    shares: 12,
  },
  {
    id: "3",
    user: {
      name: "David Goria",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=david&backgroundColor=ffd5dc",
    },
    time: "1 day ago",
    content:
      "Working on some new designs. Creativity flows when you find your rhythm. What do you think of this composition?",
    images: [],
    likes: 890,
    comments: 34,
    shares: 7,
  },
];

export const friendRequests = [
  {
    id: "1",
    name: "Anthony Daugloi",
    mutual: 12,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=anthony&backgroundColor=b6e3f4",
  },
  {
    id: "2",
    name: "Mohannad Zitoun",
    mutual: 8,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=mohannad&backgroundColor=ffdfbf",
  },
  {
    id: "3",
    name: "Mohannad Zitoun",
    mutual: 5,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=mohannad2&backgroundColor=d1d4f9",
  },
];

export const confirmFriends = [
  {
    id: "1",
    name: "Anthony Daugloi",
    mutual: 12,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=anthony&backgroundColor=b6e3f4",
  },
  {
    id: "2",
    name: "David Agfree",
    mutual: 9,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=davidA&backgroundColor=c0aede",
  },
  {
    id: "3",
    name: "Hugury Daugloi",
    mutual: 3,
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=hugury&backgroundColor=ffd5dc",
  },
];

export const contacts = [
  {
    id: "1",
    name: "Hurin Seary",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=hurin&backgroundColor=ffd5dc",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Victor Exrixon",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=victor&backgroundColor=ffdfbf",
    online: false,
  },
  {
    id: "3",
    name: "Surfiya Zakir",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=surfiya&backgroundColor=c0aede",
    online: true,
    away: true,
  },
  {
    id: "4",
    name: "Gorla Coast",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=gorla&backgroundColor=d1d4f9",
    online: true,
  },
  {
    id: "5",
    name: "Hurin Seary",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=hurin2&backgroundColor=b6e3f4",
    time: "4:09 pm",
    online: false,
  },
  {
    id: "6",
    name: "David Goria",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=davidG&backgroundColor=ffdfbf",
    time: "2 days",
    online: false,
  },
  {
    id: "7",
    name: "Seary Victor",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=searyV&backgroundColor=c0aede",
    online: true,
  },
  {
    id: "8",
    name: "Ana Seary",
    avatar:
      "https://api.dicebear.com/7.x/avataaars/svg?seed=ana&backgroundColor=ffd5dc",
    online: true,
  },
];

export const groups = [
  {
    id: "1",
    name: "Studio Express",
    avatar: "UD",
    color: "bg-purple-500",
    time: "3 min",
    online: false,
  },
  {
    id: "2",
    name: "Armany Design",
    avatar: "AR",
    color: "bg-orange-400",
    online: true,
    away: true,
  },
  {
    id: "3",
    name: "De fabous",
    avatar: "UD",
    color: "bg-purple-600",
    online: true,
  },
];

export const pages = [
  {
    id: "1",
    name: "Armany Seary",
    avatar: "AB",
    color: "bg-blue-500",
    online: true,
  },
  {
    id: "2",
    name: "Entropio Inc",
    avatar: "SD",
    color: "bg-orange-500",
    online: true,
  },
];

export const navItems = [
  {
    id: "newsfeed",
    label: "Newsfeed",
    icon: "Home",
    color: "text-blue-500",
    bg: "bg-blue-100",
  },
  {
    id: "badges",
    label: "Badges",
    icon: "Award",
    color: "text-orange-500",
    bg: "bg-orange-100",
  },
  {
    id: "stories",
    label: "Explore Stories",
    icon: "Globe",
    color: "text-yellow-500",
    bg: "bg-yellow-100",
  },
  {
    id: "groups",
    label: "Popular Groups",
    icon: "Users",
    color: "text-red-500",
    bg: "bg-red-100",
  },
  {
    id: "friends",
    label: "Bạn bè",
    icon: "Users",
    color: "text-green-500",
    bg: "bg-green-100",
  },
  {
    id: "profile",
    label: "Author Profile",
    icon: "User",
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    id: "poker-game",
    label: "Poker Club",
    icon: "Coins",
    color: "text-emerald-500",
    bg: "bg-emerald-100",
  },
];

export const morePages = [
  {
    id: "email",
    label: "Email Box",
    icon: "Mail",
    badge: 584,
    color: "text-slate-600",
  },
  {
    id: "hotel",
    label: "Near Hotel",
    icon: "Building2",
    color: "text-slate-600",
  },
  {
    id: "event",
    label: "Latest Event",
    icon: "Calendar",
    color: "text-slate-600",
  },
  { id: "stream", label: "Live Stream", icon: "Tv", color: "text-slate-600" },
];

export const notifications = [
  {
    day: "Today",
    items: [
      {
        id: "1",
        user: {
          name: "Victor Exrixon",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=victor&backgroundColor=ffdfbf",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "12 minutes ago",
        type: "post",
        color: "bg-blue-500",
        unread: true,
      },
      {
        id: "2",
        user: {
          name: "Surfiya Zakir",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=surfiya&backgroundColor=c0aede",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "30 minutes ago",
        type: "post",
        color: "bg-blue-500",
      },
      {
        id: "3",
        user: {
          name: "Goria Coast",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gorla&backgroundColor=d1d4f9",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "1 hours ago",
        type: "post",
        color: "bg-blue-500",
      },
      {
        id: "4",
        user: {
          name: "Hurin Seary",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hurin&backgroundColor=ffd5dc",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "3 hours ago",
        type: "alert",
        color: "bg-red-500",
      },
    ],
  },
  {
    day: "Yesterday",
    items: [
      {
        id: "5",
        user: {
          name: "Goria Coast",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gorla&backgroundColor=d1d4f9",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "12:48 PM",
        type: "post",
        color: "bg-blue-500",
      },
      {
        id: "6",
        user: {
          name: "Hurin Seary",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hurin&backgroundColor=ffd5dc",
        },
        action: "posted in",
        target: "UI/UX Community",
        content: "Mobile Apps UI Designer is required for tech...",
        time: "12:48 PM",
        type: "alert",
        color: "bg-red-500",
      },
    ],
  },
];
