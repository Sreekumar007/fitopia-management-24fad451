import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Upload, Video, Plus, FilePlus, AlertCircle } from 'lucide-react';
import { uploadTrainerVideo } from '@/services/trainerService';

interface VideoUploaderProps {
  onVideoUploaded: () => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoUploaded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error("Please select a valid video file");
        return;
      }
      
      setSelectedFile(file);
      // Create a preview URL for the video
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !category || !selectedFile) {
      toast.error("Please fill in all required fields and select a video");
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('video_file', selectedFile);
      
      await uploadTrainerVideo(formData);
      
      toast.success("Video uploaded successfully");
      resetForm();
      setOpenDialog(false);
      onVideoUploaded(); // Refresh the video list
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setSelectedFile(null);
    setVideoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          <span>Upload Video</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Training Video</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter video title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
            <Input 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              placeholder="e.g., Cardio, Strength, Yoga"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide details about this video"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Video File <span className="text-red-500">*</span></Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300'
              }`}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="video/*"
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Video className="h-8 w-8 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-green-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {videoPreview && (
                    <div className="mt-2 max-w-xs mx-auto">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full rounded" 
                        style={{ maxHeight: '160px' }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium">Drag & drop your video or click to browse</p>
                  <p className="text-xs text-gray-500">MP4, MOV, or WebM format (max 100MB)</p>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <AlertCircle className="inline h-3 w-3 mr-1" />
              Make sure your video is properly compressed to ensure smooth playback
            </p>
          </div>
          
          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              disabled={isUploading || !selectedFile}
              className="relative"
            >
              {isUploading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white absolute left-3"></span>
                  <span className="ml-5">Uploading...</span>
                </>
              ) : (
                <>
                  <FilePlus className="h-4 w-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VideoUploader; 