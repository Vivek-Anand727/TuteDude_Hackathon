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
} from "@/components/ui/dialog";
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  IndianRupee,
  MapPin,
  Package,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

interface Request {
  _id: string;
  id?: string;
  item: string;
  quantity: string;
  desiredPrice: number;
  location: string;
  status: "open" | "fulfilled" | "expired";
  offersCount?: number;
  acceptedPrice?: number;
  createdAt: string;
  description?: string;
  urgency?: string;
}

interface RequestCardProps {
  request: Request;
}

const RequestCard = ({ request }: RequestCardProps) => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [showOffers, setShowOffers] = useState(false);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [hasLoadedOffers, setHasLoadedOffers] = useState(false);
  const [actualOffersCount, setActualOffersCount] = useState(request.offersCount || 0);
  
  // Counter offer state
  const [counterOfferDialog, setCounterOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [counterOfferData, setCounterOfferData] = useState({
    offeredPrice: "",
    eta: "",
    notes: ""
  });
  const [submittingCounter, setSubmittingCounter] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Auto-load offer count on component mount
  const fetchOfferCount = async () => {
    const requestId = request._id || request.id;
    
    try {
      const res = await axios.get(
        `${backendURL}/api/offers/request/${requestId}`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        const offersData = res.data.offers || [];
        setActualOffersCount(offersData.length);
        // Store offers but don't show them yet
        setOffers(offersData);
        setHasLoadedOffers(true);
      }
    } catch (error) {
      console.error('🚨 Fetch offer count error:', error);
      // If error, keep the original count from request
      setActualOffersCount(request.offersCount || 0);
    }
  };

  // Load full offers and toggle visibility
  const toggleOffers = async () => {
    if (hasLoadedOffers) {
      setShowOffers(!showOffers);
      return;
    }

    const requestId = request._id || request.id;
    console.log('🔍 Fetching offers for request:', requestId);
    
    try {
      setLoadingOffers(true);
      const res = await axios.get(
        `${backendURL}/api/offers/request/${requestId}`,
        getAuthHeaders()
      );
      
      console.log('📡 Offers API Response:', res.data);
      
      if (res.data.success) {
        setOffers(res.data.offers || []);
        setActualOffersCount((res.data.offers || []).length);
        setHasLoadedOffers(true);
        setShowOffers(true);
      }
    } catch (error) {
      console.error('🚨 Fetch offers error:', error);
    } finally {
      setLoadingOffers(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/${offerId}/accept`,
        {},
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Offer accepted successfully!",
        });
        // Refresh offers
        setHasLoadedOffers(false);
        setShowOffers(false);
        fetchOfferCount();
      }
    } catch (error) {
      console.error('Accept offer error:', error);
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      });
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/${offerId}/reject`,
        {},
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Offer rejected successfully!",
        });
        // Refresh offers
        setHasLoadedOffers(false);
        setShowOffers(false);
        fetchOfferCount();
      }
    } catch (error) {
      console.error('Reject offer error:', error);
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive",
      });
    }
  };

  const handleCounterOffer = (offer) => {
    setSelectedOffer(offer);
    setCounterOfferData({
      offeredPrice: offer.offeredPrice.toString(),
      eta: offer.eta,
      notes: offer.notes || ""
    });
    setCounterOfferDialog(true);
  };

  const submitCounterOffer = async () => {
    if (!counterOfferData.offeredPrice || !counterOfferData.eta) {
      toast({
        title: "Error",
        description: "Please fill in price and delivery time",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCounter(true);
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/${selectedOffer._id}/counter`,
        {
          offeredPrice: Number(counterOfferData.offeredPrice),
          eta: counterOfferData.eta,
          notes: counterOfferData.notes
        },
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Counter offer sent successfully!",
        });
        
        // Reset and close dialog
        setCounterOfferDialog(false);
        setSelectedOffer(null);
        setCounterOfferData({ offeredPrice: "", eta: "", notes: "" });
        
        // Refresh offers
        setHasLoadedOffers(false);
        setShowOffers(false);
        fetchOfferCount();
      }
    } catch (error) {
      console.error('Counter offer error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send counter offer",
        variant: "destructive",
      });
    } finally {
      setSubmittingCounter(false);
    }
  };

  // Auto-load offer count when component mounts (only for open requests)
  useEffect(() => {
    if (request.status === "open") {
      fetchOfferCount();
    }
  }, [request._id, request.status]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "open":
        return {
          label: "Open",
          variant: "default" as const,
          icon: Clock,
          color: "text-primary"
        };
      case "fulfilled":
        return {
          label: "Fulfilled",
          variant: "secondary" as const,
          icon: CheckCircle,
          color: "text-green-600"
        };
      case "expired":
        return {
          label: "Expired", 
          variant: "destructive" as const,
          icon: AlertCircle,
          color: "text-red-600"
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
          icon: Clock,
          color: "text-muted-foreground"
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = () => {
  const requestId = request._id || request.id;
  console.log("View details for request:", requestId);
  // Add actual navigation
  navigate(`/vendor/requests/${requestId}`);
};


  return (
    <>
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
            <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
              <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
              <span>{statusConfig.label}</span>
            </Badge>
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
            
            {request.status === "fulfilled" && request.acceptedPrice && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Final Price</p>
                <p className="text-lg font-semibold text-green-600 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {request.acceptedPrice}/kg
                </p>
              </div>
            )}
            
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Offers Received</p>
              <p className="text-lg font-semibold text-primary">
                {actualOffersCount}
              </p>
            </div>

            {request.urgency && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Urgency</p>
                <Badge variant="outline" className="capitalize">
                  {request.urgency}
                </Badge>
              </div>
            )}
          </div>

          {/* Offers Section */}
          {request.status === "open" && actualOffersCount > 0 && (
            <div className="mb-4">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleOffers}
                disabled={loadingOffers}
                className="w-full"
              >
                {loadingOffers ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    {showOffers ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </>
                )}
                {showOffers ? 'Hide Offers' : 'Show Offers'} ({actualOffersCount})
              </Button>

              {showOffers && (
                <div className="mt-4 space-y-2">
                  {offers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No offers received yet
                    </p>
                  ) : (
                    offers.map(offer => (
                      <div key={offer._id} className="border rounded-lg p-3 bg-background/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{offer.supplier.name}</span>
                            <Badge variant={offer.status === 'pending' ? 'default' : 
                                          offer.status === 'accepted' ? 'secondary' : 
                                          offer.status === 'countered' ? 'outline' :
                                          'destructive'} 
                                   className="text-xs">
                              {offer.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                          <div>
                            <span className="text-muted-foreground">Price: </span>
                            <span className="font-medium">₹{offer.offeredPrice}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ETA: </span>
                            <span>{offer.eta}</span>
                          </div>
                        </div>

                        {offer.notes && (
                          <p className="text-xs text-muted-foreground mb-2">{offer.notes}</p>
                        )}

                        <div className="flex gap-2 flex-wrap">
                          {offer.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="text-xs h-7 px-2"
                                onClick={() => handleAcceptOffer(offer._id)}
                              >
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7 px-2"
                                onClick={() => handleCounterOffer(offer)}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Counter
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                className="text-xs h-7 px-2"
                                onClick={() => handleRejectOffer(offer._id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {offer.status === 'countered' && (
                            <div className="w-full">
                              <p className="text-xs text-orange-600 mb-1">
                                Counter offer sent - waiting for supplier response
                              </p>
                              <Button 
                                size="sm" 
                                className="text-xs h-7 px-2"
                                onClick={() => handleAcceptOffer(offer._id)}
                              >
                                Accept Original
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Posted {formatDate(request.createdAt)}
            </p>
            
            <Button size="sm" variant="ghost" onClick={handleViewDetails}>
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Counter Offer Dialog */}
      <Dialog open={counterOfferDialog} onOpenChange={setCounterOfferDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Send a counter offer to {selectedOffer?.supplier?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="counter-price">Your Counter Price (₹) *</Label>
                <Input
                  id="counter-price"
                  type="number"
                  placeholder="Enter your price"
                  value={counterOfferData.offeredPrice}
                  onChange={(e) => setCounterOfferData(prev => ({
                    ...prev,
                    offeredPrice: e.target.value
                  }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="counter-eta">Delivery Time *</Label>
                <Input
                  id="counter-eta"
                  placeholder="e.g., 3 days"
                  value={counterOfferData.eta}
                  onChange={(e) => setCounterOfferData(prev => ({
                    ...prev,
                    eta: e.target.value
                  }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="counter-notes">Counter Offer Notes</Label>
              <Textarea
                id="counter-notes"
                placeholder="Explain your counter offer..."
                value={counterOfferData.notes}
                onChange={(e) => setCounterOfferData(prev => ({
                  ...prev,
                  notes: e.target.value
                }))}
                rows={3}
              />
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Original Offer:</p>
              <p className="text-sm">
                <span className="font-medium">₹{selectedOffer?.offeredPrice}</span> - {selectedOffer?.eta}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCounterOfferDialog(false)}
              disabled={submittingCounter}
            >
              Cancel
            </Button>
            <Button onClick={submitCounterOffer} disabled={submittingCounter}>
              {submittingCounter ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Counter Offer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequestCard;
