import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Upload, X, Mail, Phone, MapPin, Linkedin, Globe, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolvePhotoUrl } from "@/lib/storageUtils";
import type { PersonalInfo } from "./types";
import { cn } from "@/lib/utils";

interface Props {
  personalInfo: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
  userId: string;
}

export default function PersonalInfoSection({ personalInfo, onChange, userId }: Props) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [resolvedPhotoUrl, setResolvedPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    if (personalInfo.photoUrl) {
      resolvePhotoUrl(personalInfo.photoUrl).then((url) => {
        if (!cancelled) setResolvedPhotoUrl(url);
      });
    } else {
      setResolvedPhotoUrl(null);
    }
    return () => { cancelled = true; };
  }, [personalInfo.photoUrl]);

  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...personalInfo, [field]: value });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("resume-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      onChange({ ...personalInfo, photoUrl: path });
      toast({ title: "Photo uploaded!" });
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onChange({ ...personalInfo, photoUrl: undefined });
  };

  return (
    <Card className="border-slate-100 shadow-sm rounded-[2rem] overflow-hidden bg-white">
      <CardContent className="p-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              {resolvedPhotoUrl ? (
                <AvatarImage src={resolvedPhotoUrl} alt="Profile" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-slate-50 text-slate-300">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>

            {personalInfo.photoUrl && (
              <button 
                onClick={removePhoto}
                className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name
                </Label>
                <Input 
                  value={personalInfo.fullName || ""} 
                  onChange={(e) => update("fullName", e.target.value)} 
                  placeholder="John Doe"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location
                </Label>
                <Input 
                  value={personalInfo.location || ""} 
                  onChange={(e) => update("location", e.target.value)} 
                  placeholder="San Francisco, CA"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input 
                  value={personalInfo.email || ""} 
                  onChange={(e) => update("email", e.target.value)} 
                  placeholder="john@example.com"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone
                </Label>
                <Input 
                  value={personalInfo.phone || ""} 
                  onChange={(e) => update("phone", e.target.value)} 
                  placeholder="+1 (555) 000-0000"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Linkedin className="w-3 h-3" /> LinkedIn
                </Label>
                <Input 
                  value={personalInfo.linkedin || ""} 
                  onChange={(e) => update("linkedin", e.target.value)} 
                  placeholder="linkedin.com/in/johndoe"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> Portfolio
                </Label>
                <Input 
                  value={personalInfo.portfolio || ""} 
                  onChange={(e) => update("portfolio", e.target.value)} 
                  placeholder="johndoe.com"
                  className="h-12 rounded-xl bg-slate-50/50 border-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-bold"
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
