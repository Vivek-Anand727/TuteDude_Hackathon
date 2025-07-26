import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Eye,
  MessageSquare
} from "lucide-react";
import CreateRequestDialog from "@/components/vendor/CreateRequestDialog";
import CreateGroupDialog from "@/components/vendor/CreateGroupDialog";
import RequestCard from "@/components/vendor/RequestCard";
import GroupCard from "@/components/vendor/GroupCard";

const VendorDashboard = () => {
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  // Mock data - replace with actual API calls
  const stats = {
    activeRequests: 3,
    totalOffers: 12,
    acceptedDeals: 8,
    groupsJoined: 2
  };

  const recentRequests = [
    {
      id: "1",
      item: "Tomatoes",
      quantity: "50kg",
      desiredPrice: 15,
      location: "Mumbai",
      status: "open" as const,
      offersCount: 4,
      createdAt: "2025-01-26T10:00:00Z"
    },
    {
      id: "2", 
      item: "Onions",
      quantity: "30kg",
      desiredPrice: 12,
      location: "Mumbai",
      status: "fulfilled" as const,
      acceptedPrice: 11,
      createdAt: "2025-01-25T14:30:00Z"
    }
  ];

  const myGroups = [
    {
      id: "1",
      name: "Pulses Bulk Buyers",
      item: "Toor Dal",
      totalQuantity: "200kg",
      desiredPrice: 110,
      memberCount: 5,
      isLeader: true,
      status: "active" as const,
      offersCount: 3
    },
    {
      id: "2",
      name: "Spice Vendors Group",
      item: "Turmeric Powder",
      totalQuantity: "100kg", 
      desiredPrice: 180,
      memberCount: 3,
      isLeader: false,
      status: "negotiating" as const,
      offersCount: 2
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Vendor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreateGroupOpen(true)}
            >
              <Users className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsCreateRequestOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Requests</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeRequests}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Offers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalOffers}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted Deals</p>
                  <p className="text-2xl font-bold text-foreground">{stats.acceptedDeals}</p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Groups Joined</p>
                  <p className="text-2xl font-bold text-foreground">{stats.groupsJoined}</p>
                </div>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            <div className="grid gap-4">
              {recentRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
            {recentRequests.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first request to start receiving offers from suppliers
                  </p>
                  <Button onClick={() => setIsCreateRequestOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="grid gap-4">
              {myGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
            {myGroups.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No groups joined</h3>
                  <p className="text-muted-foreground mb-6">
                    Join or create groups to get better prices through bulk buying
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="outline">
                      Browse Groups
                    </Button>
                    <Button onClick={() => setIsCreateGroupOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Group
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateRequestDialog 
        open={isCreateRequestOpen} 
        onOpenChange={setIsCreateRequestOpen} 
      />
      <CreateGroupDialog 
        open={isCreateGroupOpen} 
        onOpenChange={setIsCreateGroupOpen} 
      />
    </div>
  );
};

export default VendorDashboard;