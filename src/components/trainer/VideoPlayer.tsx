import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XIcon } from 'lucide-react';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    title: string;
    video_url: string;
    description?: string;
  };
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ isOpen, onClose, video }) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader className="flex justify-between items-start">
          <DialogTitle>{video.title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <XIcon className="h-4 w-4" />
            </Button>
          </DialogClose>
        </DialogHeader>
        
        <div className="mt-3">
          <div className="relative pb-[56.25%] h-0">
            <video 
              src={video.video_url} 
              controls
              autoPlay
              className="absolute top-0 left-0 w-full h-full rounded-md"
            />
          </div>
          
          {video.description && (
            <div className="mt-4 text-sm text-gray-700">
              <h3 className="font-semibold text-gray-900 mb-1">Description:</h3>
              <p>{video.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer; 