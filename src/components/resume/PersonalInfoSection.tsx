import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Upload, X, Mail, Phone, MapPin, Linkedin, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { resolvePhotoUrl } from "@/lib/storageUtils";
import type { PersonalInfo } from "./types";

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
    // Reset input so the same file can be re-selected
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
      // Store the storage path (not a public URL) for security
      onChange({ ...personalInfo, photoUrl: path });
      toast({ title: "Photo uploaded!" });
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast({ title: "Upload failed", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onChange({ ...personalInfo, photoUrl: undefined });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo + Name row */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-2">
            <Avatar className="h-20 w-20">
              {resolvedPhotoUrl ? (
                <AvatarImage src={resolvedPhotoUrl} alt="Profile" />
              ) : null}
              <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
            </Avatar>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Upload className="h-3 w-3 mr-1" />{uploading ? "..." : "Photo"}
              </Button>
              {personalInfo.photoUrl && (
                <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={removePhoto}>
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <Label className="text-xs flex items-center gap-1"><User className="h-3 w-3" />Full Name</Label>
              <Input value={personalInfo.fullName || ""} onChange={(e) => update("fullName", e.target.value)} placeholder="John Doe" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />Email</Label>
                <Input value={personalInfo.email || ""} onChange={(e) => update("email", e.target.value)} placeholder="john@example.com" />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />Phone</Label>
                <Input value={personalInfo.phone || ""} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <Label className="text-xs flex items-center gap-1"><MapPin className="h-3 w-3" />Location</Label>
          <Input value={personalInfo.location || ""} onChange={(e) => update("location", e.target.value)} placeholder="San Francisco, CA" />
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs flex items-center gap-1"><Linkedin className="h-3 w-3" />LinkedIn</Label>
            <Input value={personalInfo.linkedin || ""} onChange={(e) => update("linkedin", e.target.value)} placeholder="linkedin.com/in/johndoe" />
          </div>
          <div>
            <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" />Portfolio</Label>
            <Input value={personalInfo.portfolio || ""} onChange={(e) => update("portfolio", e.target.value)} placeholder="johndoe.com" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
