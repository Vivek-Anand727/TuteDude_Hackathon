import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  IndianRupee,
  MapPin,
  Package
} from "lucide-react";

interface Request {
  id: string;
  item: string;
  quantity: string;
  desiredPrice: number;
  location: string;
  status: "open" | "fulfilled" | "expired";
  offersCount?: number;
  acceptedPrice?: number;
  createdAt: string;
}

interface RequestCardProps {
  request: Request;
}

const RequestCard = ({ request }: RequestCardProps) => {
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
          variant: "default" as const,
          icon: CheckCircle,
          color: "text-success"
        };
      case "expired":
        return {
          label: "Expired", 
          variant: "secondary" as const,
          icon: AlertCircle,
          color: "text-muted-foreground"
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
              <p className="text-lg font-semibold text-success flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {request.acceptedPrice}/kg
              </p>
            </div>
          )}
          
          {request.status === "open" && request.offersCount !== undefined && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Offers Received</p>
              <p className="text-lg font-semibold text-primary">
                {request.offersCount}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Posted {formatDate(request.createdAt)}
          </p>
          
          <div className="flex space-x-2">
            {request.status === "open" && request.offersCount && request.offersCount > 0 && (
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                View Offers ({request.offersCount})
              </Button>
            )}
            <Button size="sm" variant="ghost">
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RequestCard;