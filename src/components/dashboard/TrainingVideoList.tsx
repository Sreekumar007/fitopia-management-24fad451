
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Video, Search, AlertCircle, PlayCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TrainingVideo {
  id: number;
  title: string;
  description: string;
  video_url: string;
  category: string;
  uploaded_by: number;
  created_at: string;
}

const API_URL = "http://localhost:5000/api";

const TrainingVideoList = () => {
  const { token } = useAuth();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchVideos();
  }, [token]);

  const fetchVideos = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/auth/training-videos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch training videos");
      }

      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to load training videos");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const categories = [...new Set(videos.map(video => video.category))];

  const filteredVideos = videos
    .filter((video) => 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      video.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((video) => 
      selectedCategory ? video.category === selectedCategory : true
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Video className="mr-2 h-5 w-5" />
              Training Videos
            </CardTitle>
            <CardDescription>Watch instructional videos and tutorials</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div key={video.id} className="border rounded-lg overflow-hidden bg-card">
                <div className="aspect-video bg-muted relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button variant="ghost" className="rounded-full w-12 h-12 bg-white/90 flex items-center justify-center p-0">
                      <PlayCircle className="h-8 w-8 text-primary" />
                    </Button>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-0.5 rounded text-xs">
                    {/* Placeholder duration */}
                    10:30
                  </span>
                </div>
                <div className="p-4">
                  <div className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-2">
                    {video.category}
                  </div>
                  <h3 className="font-semibold mb-1">{video.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{video.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">Added on {formatDate(video.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-md bg-muted/10">
            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="font-medium">No videos found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchTerm || selectedCategory ? "Try adjusting your search or filters" : "No training video records available"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrainingVideoList;
