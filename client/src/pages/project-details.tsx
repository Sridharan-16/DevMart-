import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import PaymentModal from "@/components/payment-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Download, Star, MessageCircle, Flag, Calendar, DollarSign } from "lucide-react";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["/api/projects", id],
    enabled: !!id,
  });

  const { data: purchaseData } = useQuery({
    queryKey: ["/api/purchases", id],
    enabled: !!user && !!id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["/api/reviews", id],
    enabled: !!id,
  });

  const messageProjectMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", "/api/messages", {
        projectId: parseInt(id!),
        receiverId: project?.seller?.id,
        content: data.content,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
    },
  });

  const reportProjectMutation = useMutation({
    mutationFn: async (data: { reason: string; description: string }) => {
      const res = await apiRequest("POST", "/api/reports", {
        projectId: parseInt(id!),
        sellerId: project?.seller?.id,
        reason: data.reason,
        description: data.description,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for your report. We'll review it shortly.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Project not found</h1>
            <p className="text-slate-600">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const isPurchased = purchaseData?.purchased;
  const isOwner = user?.id === project?.seller?.id;

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to contact sellers.",
        variant: "destructive",
      });
      return;
    }
    
    const content = prompt("Enter your message:");
    if (content) {
      messageProjectMutation.mutate({ content });
    }
  };

  const handleReportProject = () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to report projects.",
        variant: "destructive",
      });
      return;
    }

    const reason = prompt("Reason for reporting:");
    const description = prompt("Additional details (optional):");
    
    if (reason) {
      reportProjectMutation.mutate({ reason, description: description || "" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Project Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                {project.verified && (
                  <Badge className="bg-success-100 text-success-700 hover:bg-success-100">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <Badge variant="secondary">{project.category}</Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-blue-800 mb-4">DevMart</h1>
              
              <div className="flex items-center gap-6 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>
                      {project.seller
                        ? (project.seller.fullName?.charAt(0) || project.seller.username?.charAt(0))
                        : "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-900">
                    {project.seller
                      ? (project.seller.fullName || project.seller.username)
                      : "Unknown Seller"}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-900">{project.rating}</span>
                  <span className="text-gray-700">({project.reviewCount} reviews)</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span className="text-gray-700">{project.downloads} downloads</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-gray-700">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Project Image */}
            {project.previewImageUrl && (
              <div className="mb-6">
                <img 
                  src={project.previewImageUrl} 
                  alt={project.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Description */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">Technologies Used</h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.map((tech: string, index: number) => (
                    <Badge key={index} variant="outline">{tech}</Badge>
                  )) || <p className="text-gray-500">No technologies specified</p>}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-800">Reviews</h2>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review: any) => (
                      <div key={review.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {review.buyer.fullName?.charAt(0) || review.buyer.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm text-gray-900">{review.buyer.fullName || review.buyer.username}</span>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">No reviews yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-800 mb-2">
                    ${project.price}
                  </div>
                  <p className="text-gray-700">One-time purchase</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">File Size:</span>
                    <span className="font-medium text-gray-900">2.4 MB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">License:</span>
                    <span className="font-medium text-gray-900">Commercial</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Last Updated:</span>
                    <span className="font-medium text-gray-900">{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {isPurchased ? (
                    <Button className="w-full" asChild>
                      <a href={project.codeFileUrl} download>
                        <Download className="w-4 h-4 mr-2" />
                        Download Code
                      </a>
                    </Button>
                  ) : isOwner ? (
                    <Button className="w-full" disabled>
                      Your Project
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => setShowPaymentModal(true)}
                      disabled={!user}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Purchase Now
                    </Button>
                  )}

                  {!isOwner && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleContactSeller}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Seller
                    </Button>
                  )}

                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-gray-700"
                    onClick={handleReportProject}
                  >
                    <Flag className="w-4 h-4 mr-1" />
                    Report Project
                  </Button>
                </div>

                {!user && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800">
                      Please log in to purchase or contact the seller.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          project={project}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}
