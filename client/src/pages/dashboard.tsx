import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import UploadModal from "@/components/upload-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, DollarSign, Download, Star, TrendingUp, Eye, Package } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data: sellerData, isLoading: sellerLoading } = useQuery({
    queryKey: ["/api/dashboard/seller"],
    enabled: user?.role === "seller" || user?.role === "both",
  });

  const { data: buyerData, isLoading: buyerLoading } = useQuery({
    queryKey: ["/api/dashboard/buyer"],
    enabled: user?.role === "buyer" || user?.role === "both",
  });

  if (!user) {
    return null;
  }

  const showSellerTab = user.role === "seller" || user.role === "both";
  const showBuyerTab = user.role === "buyer" || user.role === "both";

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
          <p className="text-slate-600">Manage your projects and purchases</p>
        </div>

        <Tabs defaultValue={showSellerTab ? "seller" : "buyer"}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            {showSellerTab && <TabsTrigger value="seller">Seller</TabsTrigger>}
            {showBuyerTab && <TabsTrigger value="buyer">Buyer</TabsTrigger>}
          </TabsList>

          {showSellerTab && (
            <TabsContent value="seller" className="space-y-6">
              {/* Seller Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-black">Projects</p>
                        <p className="text-2xl font-bold text-black">
                          {sellerData?.projects?.length || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-black">Total Earnings</p>
                        <p className="text-2xl font-bold text-black">
                          ${sellerData?.projects?.reduce((sum: number, p: any) => sum + (parseFloat(p.price) * p.downloads), 0).toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Download className="h-8 w-8 text-purple-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-black">Downloads</p>
                        <p className="text-2xl font-bold text-black">
                          {sellerData?.projects?.reduce((sum: number, p: any) => sum + p.downloads, 0) || 0}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Star className="h-8 w-8 text-yellow-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-black">Avg Rating</p>
                        <p className="text-2xl font-bold text-black">
                          {sellerData?.projects?.length 
                            ? (sellerData.projects.reduce((sum: number, p: any) => sum + parseFloat(p.rating), 0) / sellerData.projects.length).toFixed(1)
                            : "0.0"
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Button */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-black">Your Projects</h2>
                <Button onClick={() => setShowUploadModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Project
                </Button>
              </div>

              {/* Projects List */}
              {sellerLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : sellerData?.projects?.length > 0 ? (
                <div className="space-y-4">
                  {sellerData.projects.map((project: any) => (
                    <Card key={project.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {project.previewImageUrl && (
                              <img 
                                src={project.previewImageUrl} 
                                alt={project.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-black">{project.title}</h3>
                                {project.verified ? (
                                  <Badge className="bg-success-100 text-success-700">Verified</Badge>
                                ) : (
                                  <Badge variant="secondary">Pending</Badge>
                                )}
                              </div>
                              <p className="text-black text-sm">{project.description.slice(0, 100)}...</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-black">
                                <span>${project.price}</span>
                                <span>{project.downloads} downloads</span>
                                <span>★ {project.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/project/${project.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">No projects yet</h3>
                    <p className="text-black mb-4">Upload your first project to start selling</p>
                    <Button onClick={() => setShowUploadModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {showBuyerTab && (
            <TabsContent value="buyer" className="space-y-6">
              <h2 className="text-xl font-semibold text-black">Your Purchases</h2>
              
              {buyerLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="h-16 w-16" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : buyerData?.purchases?.length > 0 ? (
                <div className="space-y-4">
                  {buyerData.purchases.map((purchase: any) => (
                    <Card key={purchase.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {purchase.project?.previewImageUrl && (
                              <img 
                                src={purchase.project.previewImageUrl} 
                                alt={purchase.project.title}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-black">{purchase.project?.title}</h3>
                              <p className="text-black text-sm">{purchase.project?.description?.slice(0, 100)}...</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-black">
                                <span>Purchased ${purchase.amount}</span>
                                <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={purchase.project?.codeFileUrl} download>
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            </Button>
                            <Link href={`/project/${purchase.project?.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Download className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">No purchases yet</h3>
                    <p className="text-black mb-4">Browse the marketplace to find amazing projects</p>
                    <Link href="/marketplace">
                      <Button>
                        Explore Marketplace
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}
