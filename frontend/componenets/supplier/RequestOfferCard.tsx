import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  User, 
  Package, 
  MapPin, 
  IndianRupee,
  Clock,
  TrendingUp,
  Send
} from "lucide-react";

interface Request {
  id: string;
  vendor: string;
  item: string;
  quantity: string;
  desiredPrice: number;
  location: string;
  timePosted: string;
  offersCount: number;
}

interface RequestOfferCardProps {
  request: Request;
}

const RequestOfferCard = ({ request }: RequestOfferCardProps) => {
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    price: "",
    eta: "",
    notes: ""
  });

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Submitting offer:", { requestId: request.id, ...offerData });
    setIsOfferFormOpen(false);
    setOfferData({ price: "", eta: "", notes: "" });
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
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline" className="text-xs">
              {request.timePosted}
            </Badge>
            {request.offersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {request.offersCount} offers
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Desired Price</p>
            <p className="text-lg font-semibold flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              {request.desiredPrice}/kg
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-sm flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {request.location}
            </p>
          </div>
        </div>
        
        {!isOfferFormOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Competitive opportunity
              </span>
            </div>
            
            <Button 
              size="sm"
              onClick={() => setIsOfferFormOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Make Offer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`price-${request.id}`}>Your Price (₹/kg)</Label>
                <Input
                  id={`price-${request.id}`}
                  type="number"
                  placeholder={request.desiredPrice.toString()}
                  value={offerData.price}
                  onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`eta-${request.id}`}>Delivery ETA</Label>
                <Input
                  id={`eta-${request.id}`}
                  placeholder="e.g., 2 hours"
                  value={offerData.eta}
                  onChange={(e) => setOfferData({ ...offerData, eta: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`notes-${request.id}`}>Additional Notes (Optional)</Label>
              <Textarea
                id={`notes-${request.id}`}
                placeholder="Quality details, delivery terms, etc..."
                value={offerData.notes}
                onChange={(e) => setOfferData({ ...offerData, notes: e.target.value })}
                className="min-h-[60px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => setIsOfferFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Submit Offer
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default RequestOfferCard;