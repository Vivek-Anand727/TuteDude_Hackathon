import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Crown, 
  Package, 
  MapPin, 
  IndianRupee,
  Clock,
  TrendingUp,
  Send
} from "lucide-react";

interface GroupRequest {
  id: string;
  groupName: string;
  leader: string;
  item: string;
  totalQuantity: string;
  desiredPrice: number;
  memberCount: number;
  location: string;
  timePosted: string;
  offersCount: number;
}

interface GroupRequestCardProps {
  group: GroupRequest;
}

const GroupRequestCard = ({ group }: GroupRequestCardProps) => {
  const [isOfferFormOpen, setIsOfferFormOpen] = useState(false);
  const [offerData, setOfferData] = useState({
    price: "",
    eta: "",
    notes: ""
  });

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    console.log("Submitting group offer:", { groupId: group.id, ...offerData });
    setIsOfferFormOpen(false);
    setOfferData({ price: "", eta: "", notes: "" });
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{group.groupName}</CardTitle>
              <CardDescription className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Led by {group.leader}
                </span>
                <span className="flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {group.memberCount} vendors
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant="outline" className="text-xs">
              {group.timePosted}
            </Badge>
            {group.offersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {group.offersCount} offers
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Bulk Order Details</span>
            <Badge variant="outline" className="text-xs">
              Group Purchase
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Item:</span>
              <span className="ml-2 font-medium">{group.item}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Qty:</span>
              <span className="ml-2 font-medium">{group.totalQuantity}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Target Price</p>
            <p className="text-lg font-semibold flex items-center">
              <IndianRupee className="w-4 h-4 mr-1" />
              {group.desiredPrice}/kg
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Location</p>
            <p className="text-sm flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {group.location}
            </p>
          </div>
        </div>
        
        {!isOfferFormOpen ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Bulk order advantage
              </span>
            </div>
            
            <Button 
              size="sm"
              onClick={() => setIsOfferFormOpen(true)}
            >
              <Send className="w-4 h-4 mr-2" />
              Make Group Offer
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitOffer} className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`group-price-${group.id}`}>Your Price (₹/kg)</Label>
                <Input
                  id={`group-price-${group.id}`}
                  type="number"
                  placeholder={group.desiredPrice.toString()}
                  value={offerData.price}
                  onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`group-eta-${group.id}`}>Delivery ETA</Label>
                <Input
                  id={`group-eta-${group.id}`}
                  placeholder="e.g., 3 days"
                  value={offerData.eta}
                  onChange={(e) => setOfferData({ ...offerData, eta: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`group-notes-${group.id}`}>Offer Details</Label>
              <Textarea
                id={`group-notes-${group.id}`}
                placeholder="Quality standards, bulk pricing benefits, delivery terms..."
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
                Submit Group Offer
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupRequestCard;