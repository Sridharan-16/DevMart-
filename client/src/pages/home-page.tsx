import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/navbar";
import ProjectCard from "@/components/project-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Code, Shield, MessageCircle, Lock, Download, Star, Users, CheckCircle } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  
  const { data: projects, isLoading } = useQuery({
    queryKey: ["/api/projects"],
  });

  const featuredProjects = projects?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-violet-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-black">
            Buy & Sell <span className="text-yellow-300">Verified</span> Code Projects
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-900 max-w-3xl mx-auto">
            A marketplace where every project is automatically tested and verified before listing. 
            Get quality code that actually works.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Link href="/marketplace" className="flex-1">
              <Button size="lg" variant="primary" className="w-full bg-primary-600 text-white hover:bg-primary-700 transition-transform duration-200 ease-in-out hover:scale-105">
                Browse Projects
              </Button>
            </Link>
            {user ? (
              <Link href="/dashboard" className="flex-1">
                <Button size="lg" variant="primary" className="w-full bg-primary-600 text-white hover:bg-primary-700 transition-transform duration-200 ease-in-out hover:scale-105">
                  Start Selling
                </Button>
              </Link>
            ) : (
              <Link href="/auth" className="flex-1">
                <Button size="lg" variant="primary" className="w-full bg-primary-600 text-white hover:bg-primary-700 transition-transform duration-200 ease-in-out hover:scale-105">
                  Start Selling
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Link href="/marketplace?category=mobile">
              <div className="bg-slate-50 p-6 rounded-xl text-center hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-3xl mb-4">📱</div>
                <h3 className="font-semibold text-slate-900">Mobile Apps</h3>
                <p className="text-slate-600 text-sm mt-2">iOS & Android</p>
              </div>
            </Link>
            <Link href="/marketplace?category=web">
              <div className="bg-slate-50 p-6 rounded-xl text-center hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-3xl mb-4">🌐</div>
                <h3 className="font-semibold text-slate-900">Web Apps</h3>
                <p className="text-slate-600 text-sm mt-2">Full Stack Projects</p>
              </div>
            </Link>
            <Link href="/marketplace?category=ai">
              <div className="bg-slate-50 p-6 rounded-xl text-center hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-3xl mb-4">🤖</div>
                <h3 className="font-semibold text-slate-900">AI & ML</h3>
                <p className="text-slate-600 text-sm mt-2">Machine Learning</p>
              </div>
            </Link>
            <Link href="/marketplace?category=games">
              <div className="bg-slate-50 p-6 rounded-xl text-center hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="text-3xl mb-4">🎮</div>
                <h3 className="font-semibold text-slate-900">Games</h3>
                <p className="text-slate-600 text-sm mt-2">Unity & More</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Featured Projects</h2>
            <Link href="/marketplace">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose DevMart?</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Every project is automatically verified to ensure quality and functionality
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-success-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Verified Code</h3>
              <p className="text-slate-600">All projects are automatically tested to ensure they work as described</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Direct Communication</h3>
              <p className="text-slate-600">Chat directly with sellers and get support for your purchased projects</p>
            </div>
            <div className="text-center">
              <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Secure Payments</h3>
              <p className="text-slate-600">Safe and secure payment processing with instant code access</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10K+</div>
              <div className="text-slate-400">Projects</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">5K+</div>
              <div className="text-slate-400">Developers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-slate-400">Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99%</div>
              <div className="text-slate-400">Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4 flex items-center">
                <Code className="mr-2" />
                DevMart
              </h3>
              <p className="text-slate-400 mb-4">The premier marketplace for verified code projects.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2">
                <li><Link href="/marketplace" className="hover:text-primary-400">Browse Projects</Link></li>
                <li><Link href="/marketplace?category=mobile" className="hover:text-primary-400">Mobile Apps</Link></li>
                <li><Link href="/marketplace?category=web" className="hover:text-primary-400">Web Apps</Link></li>
                <li><Link href="/marketplace?category=ai" className="hover:text-primary-400">AI & ML</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Selling</h4>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-primary-400">Start Selling</Link></li>
                <li><a href="#" className="hover:text-primary-400">Seller Guidelines</a></li>
                <li><a href="#" className="hover:text-primary-400">Pricing Guide</a></li>
                <li><a href="#" className="hover:text-primary-400">Verification Process</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-400">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary-400">Report Issues</a></li>
                <li><a href="#" className="hover:text-primary-400">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p>&copy; 2024 DevMart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
