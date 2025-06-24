import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Star } from "lucide-react";

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    description: string;
    price: string;
    category: string;
    technologies: string[];
    previewImageUrl?: string;
    verified: boolean;
    downloads: number;
    rating: string;
    reviewCount: number;
    seller: {
      id: number;
      username: string;
      fullName: string;
    };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/project/${project.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {project.previewImageUrl && (
          <div className="aspect-video overflow-hidden">
            <img 
              src={project.previewImageUrl} 
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            {project.verified ? (
              <Badge className="bg-success-100 text-success-700 hover:bg-success-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">Pending</Badge>
            )}
            <span className="text-2xl font-bold text-slate-900">${project.price}</span>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{project.title}</h3>
          <p className="text-slate-600 mb-4 line-clamp-2">{project.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Avatar className="w-8 h-8 mr-2">
                <AvatarFallback className="text-xs">
                  {project.seller.fullName?.charAt(0) || project.seller.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {project.seller.fullName || project.seller.username}
                </p>
                <div className="flex items-center">
                  <div className="flex text-yellow-400 text-xs">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(parseFloat(project.rating)) ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="text-slate-500 text-xs ml-1">({project.reviewCount})</span>
                </div>
              </div>
            </div>
            <div className="flex items-center text-slate-500 text-sm">
              <Download className="w-4 h-4 mr-1" />
              <span>{project.downloads}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {project.technologies?.slice(0, 3).map((tech, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.technologies?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{project.technologies.length - 3} more
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
