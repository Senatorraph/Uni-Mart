export type MockProduct = {
  id: string;
  name: string;
  vendor: string;
  vendorId: string;
  category: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  stock: number;
  description: string;
  emoji: string;
};

export const CATEGORIES = [
  "All",
  "Food & Drinks",
  "Electronics",
  "Clothing",
  "Books",
  "Beauty",
  "Services",
];

export const BUSINESS_CATEGORIES = [
  "Food & Drinks",
  "Electronics",
  "Clothing & Fashion",
  "Books & Stationery",
  "Beauty & Personal Care",
  "Services & Repairs",
  "Other",
];

export const PRODUCTS: MockProduct[] = [
  {
    id: "p1",
    name: "Jollof Rice & Chicken",
    vendor: "Mama Tee's Kitchen",
    vendorId: "v1",
    category: "Food & Drinks",
    price: 2500,
    comparePrice: 3000,
    rating: 4.8,
    reviews: 214,
    stock: 25,
    description:
      "Smoky party jollof rice cooked the Naija way, served with grilled chicken laps, fried plantain and coleslaw. Packed hot and delivered straight to your hostel.",
    emoji: "🍛",
  },
  {
    id: "p2",
    name: "iPhone 14 Pro (UK Used)",
    vendor: "Campus Gadgets",
    vendorId: "v2",
    category: "Electronics",
    price: 685000,
    comparePrice: 740000,
    rating: 4.6,
    reviews: 58,
    stock: 3,
    description:
      "Clean UK used iPhone 14 Pro, 256GB, 91% battery health, Face ID working perfectly. Comes with charger and a free tempered glass.",
    emoji: "📱",
  },
  {
    id: "p3",
    name: "Custom Ankara Shirt",
    vendor: "Naija Threads",
    vendorId: "v3",
    category: "Clothing",
    price: 12500,
    rating: 4.7,
    reviews: 96,
    stock: 14,
    description:
      "Hand-sewn Ankara shirt in premium wax print. Choose your size and pattern — stitched on campus within 3 days.",
    emoji: "👕",
  },
  {
    id: "p4",
    name: "Small Chops Party Pack",
    vendor: "Mama Tee's Kitchen",
    vendorId: "v1",
    category: "Food & Drinks",
    price: 4000,
    comparePrice: 4800,
    rating: 4.9,
    reviews: 342,
    stock: 40,
    description:
      "Puff puff, samosa, spring rolls and peppered gizzard — enough for four people. Perfect for hostel link-ups.",
    emoji: "🍢",
  },
  {
    id: "p5",
    name: "Oraimo PowerBank 20000mAh",
    vendor: "Campus Gadgets",
    vendorId: "v2",
    category: "Electronics",
    price: 18500,
    comparePrice: 22000,
    rating: 4.4,
    reviews: 127,
    stock: 31,
    description:
      "Survive NEPA with 20000mAh of fast charge. Dual USB output, USB-C input, LED display. One year warranty.",
    emoji: "🔋",
  },
  {
    id: "p6",
    name: "Engineering Maths Textbook",
    vendor: "Toru Book Hub",
    vendorId: "v4",
    category: "Books",
    price: 6500,
    rating: 4.3,
    reviews: 41,
    stock: 8,
    description:
      "Complete Engineering Mathematics for 200 & 300 level. Neat copy, no missing pages, lightly highlighted.",
    emoji: "📚",
  },
  {
    id: "p7",
    name: "Shea Butter Glow Kit",
    vendor: "Glow by Ada",
    vendorId: "v5",
    category: "Beauty",
    price: 7800,
    comparePrice: 9500,
    rating: 4.9,
    reviews: 188,
    stock: 22,
    description:
      "Raw shea butter, black soap and carrot oil serum. Locally sourced, fragrance-free and hostel-weather approved.",
    emoji: "🧴",
  },
  {
    id: "p8",
    name: "Laptop Repair & Cleanup",
    vendor: "TechFix Campus",
    vendorId: "v6",
    category: "Services",
    price: 5000,
    rating: 4.5,
    reviews: 73,
    stock: 99,
    description:
      "Full diagnostics, dust cleanup, thermal paste replacement and OS tune-up. Same-day turnaround at your hostel.",
    emoji: "🛠️",
  },
];

export type MockVendor = {
  id: string;
  name: string;
  category: string;
  rating: number;
  isOpen: boolean;
  sales: number;
  emoji: string;
};

export const VENDORS: MockVendor[] = [
  { id: "v1", name: "Mama Tee's Kitchen", category: "Food & Drinks", rating: 4.8, isOpen: true, sales: 1284, emoji: "🍲" },
  { id: "v2", name: "Campus Gadgets", category: "Electronics", rating: 4.6, isOpen: true, sales: 412, emoji: "💻" },
  { id: "v3", name: "Naija Threads", category: "Clothing", rating: 4.7, isOpen: false, sales: 208, emoji: "🧵" },
  { id: "v4", name: "Toru Book Hub", category: "Books", rating: 4.3, isOpen: true, sales: 96, emoji: "📖" },
  { id: "v5", name: "Glow by Ada", category: "Beauty", rating: 4.9, isOpen: true, sales: 631, emoji: "✨" },
  { id: "v6", name: "TechFix Campus", category: "Services", rating: 4.5, isOpen: false, sales: 154, emoji: "🔧" },
];

export const CART_ITEMS = [
  { id: "c1", productId: "p1", name: "Jollof Rice & Chicken", vendor: "Mama Tee's Kitchen", price: 2500, qty: 2, emoji: "🍛" },
  { id: "c2", productId: "p4", name: "Small Chops Party Pack", vendor: "Mama Tee's Kitchen", price: 4000, qty: 1, emoji: "🍢" },
  { id: "c3", productId: "p5", name: "Oraimo PowerBank 20000mAh", vendor: "Campus Gadgets", price: 18500, qty: 1, emoji: "🔋" },
];

export type MockOrder = {
  id: string;
  vendor: string;
  vendorEmoji: string;
  student: string;
  items: string;
  itemCount: number;
  total: number;
  status: string;
  date: string;
  address: string;
};

export const ORDERS: MockOrder[] = [
  { id: "UM-10432", vendor: "Mama Tee's Kitchen", vendorEmoji: "🍲", student: "Chidi Okafor", items: "Jollof Rice & Chicken ×2, Small Chops ×1", itemCount: 3, total: 9500, status: "out_for_delivery", date: "Today, 12:42 PM", address: "Block C, Room 204, Mandate Hostel" },
  { id: "UM-10428", vendor: "Campus Gadgets", vendorEmoji: "💻", student: "Aisha Bello", items: "Oraimo PowerBank ×1", itemCount: 1, total: 19000, status: "delivered", date: "Yesterday, 4:15 PM", address: "Block A, Room 12, Unity Hall" },
  { id: "UM-10419", vendor: "Glow by Ada", vendorEmoji: "✨", student: "Tunde Alabi", items: "Shea Butter Glow Kit ×1", itemCount: 1, total: 8300, status: "pending", date: "Yesterday, 9:03 AM", address: "Block D, Room 51, Faith Hostel" },
  { id: "UM-10402", vendor: "Naija Threads", vendorEmoji: "🧵", student: "Ngozi Eze", items: "Custom Ankara Shirt ×1", itemCount: 1, total: 13000, status: "disputed", date: "12 Jul, 2:20 PM", address: "Block B, Room 33, Peace Hostel" },
  { id: "UM-10388", vendor: "Toru Book Hub", vendorEmoji: "📖", student: "Emeka Nwosu", items: "Engineering Maths Textbook ×1", itemCount: 1, total: 7000, status: "confirmed", date: "10 Jul, 11:10 AM", address: "Block E, Room 7, Mandate Hostel" },
];

export const REVIEWS = [
  { id: "r1", name: "Chidi Okafor", initials: "CO", rating: 5, date: "2 days ago", text: "Best jollof on campus, no cap. Delivery took 25 minutes and it was still hot." },
  { id: "r2", name: "Aisha Bello", initials: "AB", rating: 4, date: "1 week ago", text: "Portion size is generous and the chicken was well seasoned. Would order again." },
  { id: "r3", name: "Tunde Alabi", initials: "TA", rating: 5, date: "2 weeks ago", text: "Mama Tee never disappoints. The plantain alone is worth the money." },
];

export const PENDING_VENDORS = [
  { id: "pv1", business: "Sizzle Grill Spot", category: "Food & Drinks", owner: "Blessing Ime", university: "University of Africa, Toru-Orua", applied: "26 Jul 2026" },
  { id: "pv2", business: "PrintPro Campus", category: "Services & Repairs", owner: "Yusuf Danjuma", university: "University of Africa, Toru-Orua", applied: "25 Jul 2026" },
  { id: "pv3", business: "Kicks & Co.", category: "Clothing & Fashion", owner: "Amaka Obi", university: "University of Africa, Toru-Orua", applied: "23 Jul 2026" },
];

export const DISPUTES = [
  { id: "D-2041", orderId: "UM-10402", student: "Ngozi Eze", vendor: "Naija Threads", reason: "Wrong size delivered", score: 0.82, status: "open" },
  { id: "D-2037", orderId: "UM-10360", student: "Samuel Aki", vendor: "Campus Gadgets", reason: "Item not as described", score: 0.44, status: "reviewing" },
  { id: "D-2030", orderId: "UM-10311", student: "Halima Sule", vendor: "Mama Tee's Kitchen", reason: "Order never arrived", score: 0.91, status: "open" },
];

export const RIDER_JOBS = [
  { id: "UM-10441", vendor: "Mama Tee's Kitchen", pickup: "Cafeteria Row, Shop 4", dropoff: "Block C, Room 204, Mandate Hostel", fee: 500, items: 3 },
  { id: "UM-10440", vendor: "Campus Gadgets", pickup: "Student Union Plaza", dropoff: "Block A, Room 12, Unity Hall", fee: 500, items: 1 },
  { id: "UM-10438", vendor: "Glow by Ada", pickup: "Beauty Lane, Shop 9", dropoff: "Block D, Room 51, Faith Hostel", fee: 700, items: 2 },
];

export const FORECAST = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 55 },
  { day: "Wed", value: 38 },
  { day: "Thu", value: 61 },
  { day: "Fri", value: 88 },
  { day: "Sat", value: 96 },
  { day: "Sun", value: 70 },
];

export const UNIVERSITY = "University of Africa, Toru-Orua";
