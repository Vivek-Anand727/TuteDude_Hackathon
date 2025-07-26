import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Crown, 
  TrendingUp, 
  MessageSquare,
  IndianRupee,
  Package,
  Eye
} from "lucide-react";

interface Group {
  id: string;
  name: string;
  item: string;
  totalQuantity: string;
  desiredPrice: number;
  memberCount: number;
  isLeader: boolean;
  status: "active" | "negotiating" | "closed";
  offersCount?: number;
}

interface GroupCardProps {
  group: Group;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          variant: "default" as const,
          color: "text-primary"
        };
      case "negotiating":
        return {
          label: "Negotiating",
          variant: "secondary" as const,
          color: "text-warning"
        };
      case "closed":
        return {
          label: "Closed",
          variant: "outline" as const,
          color: "text-muted-foreground"
        };
      default:
        return {
          label: status,
          variant: "secondary" as const,
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
                <span>{group.name}</span>
                {group.isLeader && (
                  <Crown className="w-4 h-4 text-warning" />
                )}
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
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge variant={statusConfig.variant} className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
            {group.isLeader && (
              <Badge variant="outline" className="text-xs">
                Leader
              </Badge>
            )}
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
        
        {group.offersCount !== undefined && group.offersCount > 0 && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  {group.offersCount} supplier offers received
                </span>
              </div>
              {group.isLeader && (
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {group.memberCount} vendors in group
            </span>
          </div>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="ghost">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GroupCard;