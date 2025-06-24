import { useState } from "react";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Lock } from "lucide-react";

const stripePromise = loadStripe("pk_test_dummy_key_for_demo");

interface PaymentModalProps {
  project: {
    id: number;
    title: string;
    price: string;
    previewImageUrl?: string;
    seller: {
      fullName: string;
      username: string;
    };
  };
  onClose: () => void;
}

function CheckoutForm({ project, onClose }: PaymentModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const confirmPurchaseMutation = useMutation({
    mutationFn: async (data: { paymentIntentId: string; projectId: number }) => {
      const res = await apiRequest("POST", "/api/confirm-purchase", data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment successful!",
        description: "You can now download the project code.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/buyer"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/project/${project.id}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        confirmPurchaseMutation.mutate({
          paymentIntentId: paymentIntent.id,
          projectId: project.id,
        });
      }
    } catch (error: any) {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            {project.previewImageUrl && (
              <img 
                src={project.previewImageUrl} 
                alt={project.title}
                className="w-16 h-12 object-cover rounded mr-4"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{project.title}</h3>
              <p className="text-slate-600 text-sm">
                by {project.seller.fullName || project.seller.username}
              </p>
            </div>
            <div className="text-xl font-bold text-slate-900">${project.price}</div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Element */}
      <div>
        <PaymentElement />
      </div>

      {/* Total */}
      <div className="border-t border-slate-200 pt-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>${project.price}</span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex space-x-3">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1" 
          disabled={!stripe || isProcessing || confirmPurchaseMutation.isPending}
        >
          {isProcessing || confirmPurchaseMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Pay Now
            </>
          )}
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-500">
          <Lock className="w-3 h-3 inline mr-1" />
          Secure payment powered by Stripe
        </p>
      </div>
    </form>
  );
}

export default function PaymentModal({ project, onClose }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState("");

  const { isLoading } = useQuery({
    queryKey: ["/api/create-payment-intent", project.id],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/create-payment-intent", { 
        projectId: project.id 
      });
      const data = await res.json();
      setClientSecret(data.clientSecret);
      return data;
    },
  });

  if (isLoading || !clientSecret) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Purchase</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm project={project} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}
