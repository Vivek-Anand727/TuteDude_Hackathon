import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Package,
  IndianRupee,
  MapPin,
  Clock,
  User,
  MessageSquare,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const RequestOfferCard = ({ request, onMakeOffer }) => {
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerData, setOfferData] = useState({
    offeredPrice: "",
    eta: "",
    notes: "",
    deliveryOptions: {
      canPickup: true,
      canDeliver: false,
      deliveryCharge: 0
    }
  });

  const handleSubmitOffer = async () => {
    if (!offerData.offeredPrice || !offerData.eta) {
      toast({
        title: "Error",
        description: "Please fill in price and delivery time",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onMakeOffer(request._id || request.id, {
        offeredPrice: Number(offerData.offeredPrice),
        eta: offerData.eta,
        notes: offerData.notes,
        deliveryOptions: offerData.deliveryOptions
      });

      // Reset form and close dialog
      setOfferData({
        offeredPrice: "",
        eta: "",
        notes: "",
        deliveryOptions: {
          canPickup: true,
          canDeliver: false,
          deliveryCharge: 0
        }
      });
      setIsOfferDialogOpen(false);
    } catch (error) {
      console.error("Submit offer error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{request.item}</CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {request.vendor}
                </span>
                <span className="flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {request.quantity}
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {request.location}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline">
              {request.offersCount} offers
            </Badge>
            {request.urgency && (
              <Badge className={getUrgencyColor(request.urgency)}>
                {request.urgency}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {request.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {request.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Desired Price</p>
            <p className="text-lg font-semibold flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              {request.desiredPrice}/kg
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Posted</p>
            <p className="text-sm flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {request.timePosted}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Quantity needed: {request.quantity}
            </span>
          </div>
          
          <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Make Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Make an Offer</DialogTitle>
                <DialogDescription>
                  Submit your offer for {request.item} - {request.quantity}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Your Price (₹/kg) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Enter your price"
                      value={offerData.offeredPrice}
                      onChange={(e) => setOfferData(prev => ({
                        ...prev,
                        offeredPrice: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eta">Delivery Time *</Label>
                    <Input
                      id="eta"
                      placeholder="e.g., 2 days"
                      value={offerData.eta}
                      onChange={(e) => setOfferData(prev => ({
                        ...prev,
                        eta: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about your offer..."
                    value={offerData.notes}
                    onChange={(e) => setOfferData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Delivery Options</Label>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={offerData.deliveryOptions.canPickup}
                        onChange={(e) => setOfferData(prev => ({
                          ...prev,
                          deliveryOptions: {
                            ...prev.deliveryOptions,
                            canPickup: e.target.checked
                          }
                        }))}
                      />
                      <span className="text-sm">Customer can pickup</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={offerData.deliveryOptions.canDeliver}
                        onChange={(e) => setOfferData(prev => ({
                          ...prev,
                          deliveryOptions: {
                            ...prev.deliveryOptions,
                            canDeliver: e.target.checked
                          }
                        }))}
                      />
                      <span className="text-sm">I can deliver</span>
                    </label>
                    {offerData.deliveryOptions.canDeliver && (
                      <div className="ml-6">
                        <Input
                          type="number"
                          placeholder="Delivery charge (₹)"
                          value={offerData.deliveryOptions.deliveryCharge}
                          onChange={(e) => setOfferData(prev => ({
                            ...prev,
                            deliveryOptions: {
                              ...prev.deliveryOptions,
                              deliveryCharge: Number(e.target.value)
                            }
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOfferDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmitOffer} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Offer"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestOfferCard;
