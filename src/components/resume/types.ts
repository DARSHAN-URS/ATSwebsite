export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
  
  photoUrl?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  description: string;
  bullets: string[];
}

export interface EducationItem {
  degree: string;
  school: string;
  year?: string;
}

export interface CustomSection {
  id: string;
  title: string;
  items: string[];
}

export interface ResumeData {
  personalInfo?: PersonalInfo;
  summary?: string;
  skills?: string[];
  experience?: ExperienceItem[];
  education?: EducationItem[];
  customSections?: CustomSection[];
}
