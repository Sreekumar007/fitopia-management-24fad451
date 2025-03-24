import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Video, 
  Play, 
  CalendarDays, 
  Filter,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface TrainingVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  category: string;
  created_at: string;
}

interface TrainingVideoListProps {
  videos: TrainingVideo[];
  isLoading: boolean;
}

const TrainingVideoList: React.FC<TrainingVideoListProps> = ({ videos, isLoading }) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<TrainingVideo | null>(null);
  
  const categories = Array.from(new Set(videos.map(video => video.category)));

  const filteredVideos = categoryFilter
    ? videos.filter(video => video.category === categoryFilter)
    : videos;

  if (isLoading) {
    return (
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-indigo-50 border-b border-indigo-100">
          <CardTitle className="flex items-center text-indigo-800">
            <Video className="mr-2 h-5 w-5 text-indigo-600" />
            Training Videos
          </CardTitle>
          <CardDescription>Fitness training videos for your workout routine</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="bg-indigo-50 border-b border-indigo-100">
        <CardTitle className="flex items-center text-indigo-800">
          <Video className="mr-2 h-5 w-5 text-indigo-600" />
          Training Videos
        </CardTitle>
        <CardDescription>Fitness training videos for your workout routine</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full text-sm text-indigo-800">
            <Filter className="h-4 w-4 mr-1" />
            <span>Filter:</span>
          </div>
          
          <Badge 
            variant={categoryFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Badge>
          
          {categories.map((category) => (
            <Badge 
              key={category}
              variant={categoryFilter === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategoryFilter(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Video className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p>No training videos available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVideos.map((video) => (
              <div 
                key={video.id} 
                className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-video bg-gray-100 relative flex items-center justify-center group">
                  {/* Video thumbnail with play button */}
                  <div 
                    className="absolute inset-0 bg-indigo-800 bg-opacity-20 group-hover:bg-opacity-30 transition-opacity"
                  ></div>
                  <Button 
                    variant="default" 
                    size="icon" 
                    className="bg-indigo-600 hover:bg-indigo-700 group-hover:scale-110 transition-transform"
                    onClick={() => setActiveVideo(video)}
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-indigo-900">{video.title}</h3>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                      {video.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {video.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    <span>{new Date(video.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Video player dialog */}
      {activeVideo && (
        <Dialog open={!!activeVideo} onOpenChange={(open) => !open && setActiveVideo(null)}>
          <DialogContent className="sm:max-w-[80vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{activeVideo.title}</DialogTitle>
              <DialogDescription>{activeVideo.category}</DialogDescription>
            </DialogHeader>
            
            <div className="aspect-video w-full bg-black overflow-hidden rounded-md">
              <iframe
                width="100%"
                height="100%"
                src={activeVideo.video_url}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-600">{activeVideo.description}</p>
            </div>
            
            <DialogClose className="absolute top-4 right-4">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default TrainingVideoList;
