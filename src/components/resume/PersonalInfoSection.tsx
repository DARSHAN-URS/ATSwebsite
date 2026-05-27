import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Upload, X, Mail, Phone, MapPin, Linkedin, Globe, Camera, Loader2, Sparkles, AlertCircle, Lightbulb } from "lucide-react";
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

  // Cropper state
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    
    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result?.toString() || null);
    });
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const confirmCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const ext = selectedFileName.split(".").pop() || "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      
      const file = new File([croppedBlob], `cropped.${ext}`, { type: "image/jpeg" });
      const { error } = await supabase.storage.from("resume-photos").upload(path, file, { upsert: true });
      if (error) throw error;
      onChange({ ...personalInfo, photoUrl: path });
      toast({ title: "Photo uploaded!" });
      setImageToCrop(null);
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
    <Card className="rounded-[3rem] border-none bg-white shadow-[0_20px_50px_rgba(0,0,0,0.03)] overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Main Form Area */}
        <div className="flex-1 p-12 space-y-12">
          <div className="flex flex-col md:flex-row items-center gap-12 border-b border-slate-50 pb-12">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden relative group">
                {resolvedPhotoUrl ? (
                  <img src={resolvedPhotoUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <User className="w-12 h-12" />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-10"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-center md:text-left">
               <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity Image</h3>
               <p className="text-sm text-slate-500 font-medium">Upload a professional high-resolution headshot.</p>
               <div className="flex items-center gap-4 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50">Change Photo</Button>
                  {personalInfo.photoUrl && <Button variant="ghost" size="sm" onClick={removePhoto} className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50">Remove</Button>}
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Full Name</Label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.fullName || ""} 
                  onChange={(e) => update("fullName", e.target.value)} 
                  placeholder="e.g. John Doe"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
                <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-200 cursor-pointer hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.location || ""} 
                  onChange={(e) => update("location", e.target.value)} 
                  placeholder="e.g. San Francisco, CA"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Email Vector</Label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.email || ""} 
                  onChange={(e) => update("email", e.target.value)} 
                  placeholder="e.g. john@example.com"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Phone Link</Label>
              <div className="relative">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.phone || ""} 
                  onChange={(e) => update("phone", e.target.value)} 
                  placeholder="e.g. +1 555-000-0000"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.linkedin || ""} 
                  onChange={(e) => update("linkedin", e.target.value)} 
                  placeholder="linkedin.com/in/username"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
              </div>
            </div>

            <div className="space-y-3 group/input">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-focus-within/input:text-blue-600 transition-colors">Portfolio URL</Label>
              <div className="relative">
                <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-blue-600 transition-colors" />
                <Input 
                  value={personalInfo.portfolio || ""} 
                  onChange={(e) => update("portfolio", e.target.value)} 
                  placeholder="yourname.com"
                  className="h-16 pl-14 pr-12 rounded-2xl bg-slate-50/50 border-none focus:bg-white focus:ring-4 focus:ring-blue-600/5 transition-all text-sm font-bold placeholder:text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!imageToCrop} onOpenChange={(open) => !open && setImageToCrop(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crop Image</DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setImageToCrop(null)}>Cancel</Button>
            <Button onClick={confirmCrop} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Crop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
