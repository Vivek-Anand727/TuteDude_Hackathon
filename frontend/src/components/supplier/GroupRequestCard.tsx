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
  Users, 
  Crown, 
  TrendingUp, 
  IndianRupee,
  Package,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const GroupRequestCard = ({ group, onMakeOffer }) => {
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
      await onMakeOffer(group._id || group.id, {
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
      console.error("Submit group offer error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed getStatusConfig to return proper Badge variant types
  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          variant: "default" as const, // ✅ Fixed: explicit const assertion
          color: "text-primary"
        };
      case "negotiating":
        return {
          label: "Negotiating",
          variant: "secondary" as const, // ✅ Fixed: explicit const assertion
          color: "text-yellow-600"
        };
      case "completed":
        return {
          label: "Completed",
          variant: "outline" as const, // ✅ Fixed: explicit const assertion
          color: "text-green-600"
        };
      default:
        return {
          label: status,
          variant: "secondary" as const, // ✅ Fixed: explicit const assertion
          color: "text-muted-foreground"
        };
    }
  };

  const statusConfig = getStatusConfig(group.status);

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <span>{group.groupName}</span>
                <Crown className="w-4 h-4 text-yellow-500" />
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Package className="w-3 h-3 mr-1" />
                  {group.item}
                </span>
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {group.memberCount} members
                </span>
                <span className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {group.location}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {/* ✅ Fixed: Remove className prop that was causing the issue */}
            <Badge variant={statusConfig.variant}>
              {statusConfig.label}
            </Badge>
            <Badge variant="outline">
              {group.offersCount} offers
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Quantity</p>
            <p className="text-lg font-semibold">
              {group.totalQuantity}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Target Price</p>
            <p className="text-lg font-semibold flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              {group.desiredPrice}/kg
            </p>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-500/5 rounded-lg border border-blue-500/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Group Leader: {group.leader}</p>
              <p className="text-xs text-muted-foreground">
                Posted {group.timePosted}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Bulk order opportunity
            </span>
          </div>
          
          <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                Make Group Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Make a Group Offer</DialogTitle>
                <DialogDescription>
                  Submit your offer for {group.item} - {group.totalQuantity} (Group: {group.groupName})
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
                      placeholder="e.g., 3 days"
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
                    placeholder="Bulk discount details, quality specifications, etc..."
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
                      <span className="text-sm">Group can pickup</span>
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
                    "Submit Group Offer"
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

export default GroupRequestCard;
