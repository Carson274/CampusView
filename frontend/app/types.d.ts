import { Float } from "react-native/Libraries/Types/CodegenTypes";

export interface Schedule {
  days: {
    day: string;
    hours: {
      open: string;
      close: string;
    }[];
  }[];
}

export type Review = {
  review_id: number;
  type: "restaurant" | "studyspot" | "club" | "review";
  owner: string;
  user: string;
  rating: number;
  time: string;
  message?: string;
};

export interface ReviewSection {
  score: number;
  reviews: Review[];
  hidden: boolean;
}

export interface Club {
  name: string;
  image: string;
  admins: number[];
  schedule: Schedule;
  location: string;
  link: string;
  description: string;
  reviews: ReviewSection | null;
  college: string;
}

export type Restaurant = {
  name: string;
  location: string;
  image: string;
  dining_hall: string;
  schedule: {
    days: {
      day: string;
      hours: { open: string; close: string }[];
    }[];
  };
  reviews?: ReviewSection;
  menu?: { title: string; items: string[] }[];
  rating?: string;
};

export interface StudySpot {
  building: string;
  floor_number: number;
  noise_level: "quiet" | "moderate" | "loud";
  crowd_level: "empty" | "few" | "crowd";
  schedule: Schedule;
}


// Schedule types
// Spread across multiple interfaces for readability
export interface Schedule {
  days: Day[];
}

export interface Day {
  day: string;
  hours: Hours[];
}

export interface Hours {
  open: string;
  close: string;
}



// Props types
export interface ReviewModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (review: string, rating: number) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  rating: number;
  setRating: (rating: number) => void;
  owner: string;
  username: string;
  reviewToEdit?: Review | null; 
}