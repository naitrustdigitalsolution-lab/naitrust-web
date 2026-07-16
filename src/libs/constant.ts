/**
 * Application Constants
 * Shared constants used throughout the application
 */

// Business Categories
export const CATEGORIES = [
  'Fashion & Clothing', 'Electronics & Gadgets', 'Food & Restaurants', 'Beauty & Cosmetics',
  'Home & Furniture', 'Automotive & Vehicles', 'Real Estate & Properties', 'Professional Services',
  'Health & Wellness', 'Education & Training', 'Entertainment & Events', 'Agriculture & Farming',
  'Sports & Fitness', 'Travel & Tourism', 'Photography & Videography', 'Legal Services',
  'Accounting & Finance', 'Marketing & Advertising', 'IT & Software Development', 'Construction & Engineering',
  'Interior Design & Decor', 'Catering & Event Planning', 'Laundry & Dry Cleaning', 'Logistics & Delivery',
  'Security Services', 'Cleaning Services', 'Plumbing & Electrical', 'Tailoring & Fashion Design',
  'Hair Salon & Barbershop', 'Spa & Massage', 'Makeup & Bridal Services', 'Jewelry & Accessories',
  'Shoes & Footwear', 'Bags & Leather Goods', 'Watches & Timepieces', 'Children & Baby Products',
  'Toys & Games', 'Books & Stationery', 'Art & Craft Supplies', 'Music & Instruments',
  'Pet Care & Supplies', 'Pharmacy & Medical Supplies', 'Optical & Eyewear', 'Dental Services',
  'Physiotherapy & Rehabilitation', 'Alternative Medicine', 'Gym & Fitness Centers', 'Yoga & Meditation',
  'Dance & Aerobics', 'Martial Arts & Self Defense', 'Swimming & Aquatics', 'Hotels & Accommodation',
  'Car Rental & Hire', 'Air Travel & Ticketing', 'Visa & Immigration Services', 'Wedding Planning',
  'Birthday Party Planning', 'Corporate Events', 'DJ & Music Services', 'MC & Compere Services',
  'Photography Studios', 'Video Production', 'Graphic Design', 'Printing & Publishing',
  'Web Design & Development', 'Mobile App Development', 'Digital Marketing', 'Social Media Management',
  'Content Writing & Copywriting', 'Translation Services', 'Voice Over Services', 'Animation & 3D Design',
  'Architecture & Building Design', 'Landscaping & Gardening', 'Painting & Decoration', 'Carpentry & Woodwork',
  'Welding & Metalwork', 'Tiling & Flooring', 'Roofing Services', 'Air Conditioning & HVAC',
  'Generator Sales & Repairs', 'Solar & Renewable Energy', 'Waste Management', 'Recycling Services',
  'Grocery & Supermarkets', 'Bakery & Pastries', 'Confectionery & Sweets', 'Beverages & Drinks',
  'Butchery & Meat Shop', 'Fish & Seafood', 'Fruits & Vegetables', 'Spices & Condiments',
  'Frozen Foods', 'Organic & Health Foods', 'Fast Food & Quick Service', 'Fine Dining',
  'Cafe & Coffee Shop', 'Bar & Lounge', 'Night Club', 'Cinema & Movies',
  'Gaming & Arcade', 'Amusement Parks', 'Comedy & Stand-up', 'Theater & Drama',
  'Art Gallery & Exhibition', 'Museum & Cultural Center', 'Driving School', 'Language School',
  'Computer Training', 'Vocational Training', 'Professional Certification', 'Tutoring & Lessons',
  'Daycare & Nursery', 'Primary School', 'Secondary School', 'University & College',
  'Online Courses', 'Insurance Services', 'Investment & Asset Management', 'Banking & Microfinance',
  'Forex & Bureau de Change', 'Tax Consulting', 'Business Registration', 'Recruitment & HR Services',
  'Co-working Spaces', 'Virtual Office Services', 'Equipment Rental', 'Storage & Warehousing',
  'Import & Export', 'Wholesale & Distribution', 'Retail & Shopping', 'E-commerce & Online Store',
];

// Nigerian States
export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT (Abuja)',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
];

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'card', name: 'Debit/Credit Card', icon: '💳' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦' },
  { id: 'ussd', name: 'USSD', icon: '📱' },
  { id: 'paystack', name: 'Paystack', icon: '💰' },
  { id: 'flutterwave', name: 'Flutterwave', icon: '🦋' },
];

// Verification Tiers
export const VERIFICATION_TIERS = {
  BASIC: 'basic',
  CAC: 'cac',
  PREMIUM: 'premium',
} as const;

// Verification Statuses
export const VERIFICATION_STATUSES = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  BUSINESS: 'business',
  ADMIN: 'admin',
} as const;

// Transaction Statuses
export const TRANSACTION_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  TRANSACTION: 'transaction',
  REVIEW: 'review',
  VERIFICATION: 'verification',
  FRAUD_ALERT: 'fraud_alert',
  SYSTEM: 'system',
} as const;

// Fraud Report Types
export const FRAUD_REPORT_TYPES = {
  FAKE_BUSINESS: 'fake_business',
  SCAM: 'scam',
  FAKE_PRODUCT: 'fake_product',
  NON_DELIVERY: 'non_delivery',
  IMPERSONATION: 'impersonation',
  OTHER: 'other',
} as const;

// Hero Images for Homepage
export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1619530377876-d3a51f0bd9f2?w=800&h=600&fit=crop',
];

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Naitrust',
  APP_DESCRIPTION: 'Nigerian Business Verification and Payment Platform',
  SUPPORT_EMAIL: 'contact@naitrust.com',
  SUPPORT_PHONE: '+234-800-NAITRUST',
  PRIMARY_COLOR: '#1E90FF', // Dodger Blue
};
