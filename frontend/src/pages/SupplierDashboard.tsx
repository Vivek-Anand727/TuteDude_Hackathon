"use client";

import { useState, useEffect } from "react";
import axios from "axios";
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
  Filter,
  RefreshCw,
  LogOut
} from "lucide-react";
import RequestOfferCard from "@/components/supplier/RequestOfferCard";
import GroupRequestCard from "@/components/supplier/GroupRequestCard";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const SupplierDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("individual");
  const [refreshing, setRefreshing] = useState(false);

  // State for data
  const [stats, setStats] = useState({
    activeOffers: 0,
    acceptedOffers: 0,
    totalEarnings: 0,
    responseRate: 0
  });

  const [openRequests, setOpenRequests] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  // Enhanced error handler
  const handleApiError = (error, context = '') => {
    console.error(`${context} error:`, error);
    
    if (error.response?.status === 401) {
      handleLogout();
      return;
    }

    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
  };

  // Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "supplier") {
      navigate("/auth?role=supplier");
      return false;
    }
    return true;
  };

  // Fetch supplier's own offers to calculate stats
  const fetchMyOffers = async () => {
    try {
      const res = await axios.get(
        `${backendURL}/api/offers/my-offers`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        const offers = res.data.offers || [];
        setMyOffers(offers);
        
        // Calculate stats from offers
        const activeOffers = offers.filter(offer => offer.status === 'pending').length;
        const acceptedOffers = offers.filter(offer => offer.status === 'accepted').length;
        const totalEarnings = offers
          .filter(offer => offer.status === 'accepted')
          .reduce((sum, offer) => sum + (offer.offeredPrice * parseFloat(offer.request?.quantity?.match(/\d+/)?.[0] || 0)), 0);
        const responseRate = offers.length > 0 ? Math.round((acceptedOffers / offers.length) * 100) : 0;
        
        setStats({
          activeOffers,
          acceptedOffers,
          totalEarnings,
          responseRate
        });
      }
    } catch (err) {
      handleApiError(err, 'Fetch my offers');
    }
  };

  // Fetch open individual requests
  const fetchOpenRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get(
        `${backendURL}/api/offers/browse-requests`,
        { 
          ...getAuthHeaders(),
          params: searchQuery ? { item: searchQuery } : {}
        }
      );
      
      if (res.data.success) {
        const requests = res.data.requests || [];
        
        // Transform data to match component interface
        const transformedRequests = requests.map(request => ({
          _id: request._id,
          id: request._id,
          vendor: request.vendor?.name || 'Unknown Vendor',
          vendorId: request.vendor?._id,
          item: request.item,
          quantity: request.quantity,
          desiredPrice: request.desiredPrice,
          location: request.location,
          timePosted: new Date(request.createdAt).toLocaleDateString(),
          offersCount: request.offersCount || 0,
          description: request.description,
          urgency: request.urgency,
          status: request.status
        }));
        
        setOpenRequests(transformedRequests);
      }
    } catch (err) {
      handleApiError(err, 'Fetch open requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch active group requests
  const fetchGroupRequests = async () => {
    try {
      setLoadingGroups(true);
      const res = await axios.get(
        `${backendURL}/api/groups/requests/active`,
        { 
          ...getAuthHeaders(),
          params: searchQuery ? { item: searchQuery } : {}
        }
      );
      
      if (res.data.success) {
        const groupRequests = res.data.groupRequests || [];
        
        // Transform data to match component interface
        const transformedGroups = groupRequests.map(groupRequest => ({
          _id: groupRequest._id,
          id: groupRequest._id,
          groupName: groupRequest.group?.name || 'Unknown Group',
          leader: groupRequest.group?.leader?.name || 'Unknown Leader',
          leaderId: groupRequest.group?.leader?._id,
          item: groupRequest.item,
          totalQuantity: groupRequest.quantity,
          desiredPrice: groupRequest.desiredPrice,
          memberCount: groupRequest.group?.members?.length || 0,
          location: groupRequest.location,
          timePosted: new Date(groupRequest.createdAt).toLocaleDateString(),
          offersCount: groupRequest.offersCount || 0,
          status: groupRequest.status
        }));
        
        setGroupRequests(transformedGroups);
      }
    } catch (err) {
      handleApiError(err, 'Fetch group requests');
    } finally {
      setLoadingGroups(false);
    }
  };

  // Handle making an offer
  const handleMakeOffer = async (requestId, offerData) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/create`,
        {
          requestId,
          ...offerData
        },
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Offer submitted successfully!",
        });
        
        // Refresh data
        fetchMyOffers();
        fetchOpenRequests();
      }
    } catch (err) {
      handleApiError(err, 'Make offer');
    }
  };

  // Handle making a group offer
  const handleMakeGroupOffer = async (groupRequestId, offerData) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/groups/offers/create`,
        {
          groupRequestId,
          ...offerData
        },
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: "Group offer submitted successfully!",
        });
        
        // Refresh data
        fetchMyOffers();
        fetchGroupRequests();
      }
    } catch (err) {
      handleApiError(err, 'Make group offer');
    }
  };

  // Handle refresh
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchMyOffers(),
        fetchOpenRequests(),
        activeTab === "groups" ? fetchGroupRequests() : Promise.resolve()
      ]);
      
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      });
    } catch (err) {
      toast({
        title: "Error", 
        description: "Failed to refresh some data",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    delete axios.defaults.headers.common['Authorization'];
    navigate("/");
  };

  // Filter requests based on search query
  const filteredOpenRequests = openRequests.filter(request =>
    request.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroupRequests = groupRequests.filter(group =>
    group.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!checkAuth()) return;
    
    // Setup axios defaults
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchMyOffers();
    fetchOpenRequests();
  }, []);

  useEffect(() => {
    if (activeTab === "groups") {
      fetchGroupRequests();
    }
  }, [activeTab]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== "") {
        fetchOpenRequests();
        if (activeTab === "groups") {
          fetchGroupRequests();
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
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
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.responseRate}%</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="individual">Individual Requests</TabsTrigger>
            <TabsTrigger value="groups">Group Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Browse Vendor Requests</h2>
              <Badge variant="outline">{filteredOpenRequests.length} active requests</Badge>
            </div>
            
            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOpenRequests.map((request) => (
                  <RequestOfferCard 
                    key={request.id} 
                    request={request} 
                    onMakeOffer={handleMakeOffer}
                  />
                ))}
              </div>
            )}
            
            {!loadingRequests && filteredOpenRequests.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No requests found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 
                      "No vendor requests match your search criteria" : 
                      "No active vendor requests available"
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Browse Group Requests</h2>
              <Badge variant="outline">{filteredGroupRequests.length} active groups</Badge>
            </div>
            
            {loadingGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredGroupRequests.map((group) => (
                  <GroupRequestCard 
                    key={group.id} 
                    group={group} 
                    onMakeOffer={handleMakeGroupOffer}
                  />
                ))}
              </div>
            )}
            
            {!loadingGroups && filteredGroupRequests.length === 0 && (
              <Card className="bg-gradient-card border-border/50 shadow-card">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No group requests found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? 
                      "No group requests match your search criteria" : 
                      "No active group requests available"
                    }
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
