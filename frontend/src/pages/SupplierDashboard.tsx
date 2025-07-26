import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Users,
  IndianRupee,
  MapPin,
  Filter
} from "lucide-react";
import RequestOfferCard from "@/components/supplier/RequestOfferCard";
import GroupRequestCard from "@/components/supplier/GroupRequestCard";

const SupplierDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual API calls
  const stats = {
    activeOffers: 8,
    acceptedOffers: 12,
    totalEarnings: 45000,
    responseRate: 85
  };

  const openRequests = [
    {
      id: "1",
      vendor: "Raj Foods",
      item: "Tomatoes",
      quantity: "50kg",
      desiredPrice: 15,
      location: "Mumbai, 400001",
      timePosted: "2 hours ago",
      offersCount: 3
    },
    {
      id: "2",
      vendor: "Kumar Snacks",
      item: "Onions",
      quantity: "30kg", 
      desiredPrice: 12,
      location: "Mumbai, 400002",
      timePosted: "4 hours ago",
      offersCount: 1
    }
  ];

  const groupRequests = [
    {
      id: "1",
      groupName: "Pulses Bulk Buyers",
      leader: "Amit Vendors",
      item: "Toor Dal",
      totalQuantity: "200kg",
      desiredPrice: 110,
      memberCount: 5,
      location: "Mumbai Central",
      timePosted: "1 hour ago",
      offersCount: 2
    },
    {
      id: "2",
      groupName: "Spice Vendors Group", 
      leader: "Priya Trading",
      item: "Turmeric Powder",
      totalQuantity: "100kg",
      desiredPrice: 180,
      memberCount: 3,
      location: "Andheri",
      timePosted: "3 hours ago", 
      offersCount: 0
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Supplier Dashboard</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
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
                  <p className="text-sm text-muted-foreground">Active Offers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeOffers}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted Offers</p>
                  <p className="text-2xl font-bold text-foreground">{stats.acceptedOffers}</p>
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
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-foreground flex items-center">
                    <IndianRupee className="w-5 h-5 mr-1" />
                    {stats.totalEarnings.toLocaleString()}
                  </p>
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
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.responseRate}%</p>
                </div>
                <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="individual">Individual Requests</TabsTrigger>
            <TabsTrigger value="groups">Group Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Browse Vendor Requests</h2>
              <Badge variant="outline">{openRequests.length} active requests</Badge>
            </div>
            
            <div className="grid gap-4">
              {openRequests.map((request) => (
                <RequestOfferCard key={request.id} request={request} />
              ))}
            </div>
            
            {openRequests.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                  <p className="text-muted-foreground">
                    No vendor requests match your current search criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Browse Group Requests</h2>
              <Badge variant="outline">{groupRequests.length} active groups</Badge>
            </div>
            
            <div className="grid gap-4">
              {groupRequests.map((group) => (
                <GroupRequestCard key={group.id} group={group} />
              ))}
            </div>
            
            {groupRequests.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No group requests found</h3>
                  <p className="text-muted-foreground">
                    No group requests match your current search criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupplierDashboard;