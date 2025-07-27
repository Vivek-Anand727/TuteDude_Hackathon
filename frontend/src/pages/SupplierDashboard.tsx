"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  LogOut,
  User,
  MessageSquare,
  Eye,
  Calendar,
  AlertCircle,
  Loader2
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
  const [myGroupOffers, setMyGroupOffers] = useState([]);
  
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Counter offer state
  const [counterResponseDialog, setCounterResponseDialog] = useState(false);
  const [selectedCounterOffer, setSelectedCounterOffer] = useState(null);
  const [counterResponseData, setCounterResponseData] = useState({
    action: "",
    offeredPrice: "",
    eta: "",
    notes: ""
  });
  const [submittingCounterResponse, setSubmittingCounterResponse] = useState(false);

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

  // Fetch supplier's own individual offers
  const fetchMyOffers = async () => {
    try {
      setLoadingOffers(true);
      const res = await axios.get(
        `${backendURL}/api/offers/my-offers`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        const offers = res.data.offers || [];
        setMyOffers(offers);
        
        // Calculate stats from offers
        const activeOffers = offers.filter(offer => offer.status === 'pending' || offer.status === 'countered').length;
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
    } finally {
      setLoadingOffers(false);
    }
  };

  // Fetch supplier's own group offers
  const fetchMyGroupOffers = async () => {
    try {
      const res = await axios.get(
        `${backendURL}/api/offers/group/my-offers`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        setMyGroupOffers(res.data.offers || []);
      }
    } catch (err) {
      handleApiError(err, 'Fetch my group offers');
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
        fetchMyGroupOffers();
        fetchGroupRequests();
      }
    } catch (err) {
      handleApiError(err, 'Make group offer');
    }
  };

  // Handle responding to counter offer
  const handleCounterResponse = (offer, action) => {
    setSelectedCounterOffer(offer);
    setCounterResponseData({
      action,
      offeredPrice: action === 'accept' ? offer.offeredPrice.toString() : "",
      eta: action === 'accept' ? offer.eta : "",
      notes: ""
    });
    setCounterResponseDialog(true);
  };

  const submitCounterResponse = async () => {
    if (counterResponseData.action === 'counter' && (!counterResponseData.offeredPrice || !counterResponseData.eta)) {
      toast({
        title: "Error",
        description: "Please fill in price and delivery time for counter offer",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCounterResponse(true);
    try {
      const endpoint = selectedCounterOffer.isGroupOffer 
        ? `${backendURL}/api/offers/group/${selectedCounterOffer._id}/respond-counter`
        : `${backendURL}/api/offers/${selectedCounterOffer._id}/respond-counter`;

      const payload = counterResponseData.action === 'accept' 
        ? { action: 'accept' }
        : {
            action: 'counter',
            offeredPrice: Number(counterResponseData.offeredPrice),
            eta: counterResponseData.eta,
            notes: counterResponseData.notes
          };

      const res = await axios.post(endpoint, payload, getAuthHeaders());
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: `Successfully ${counterResponseData.action}ed counter offer!`,
        });
        
        // Reset and close dialog
        setCounterResponseDialog(false);
        setSelectedCounterOffer(null);
        setCounterResponseData({ action: "", offeredPrice: "", eta: "", notes: "" });
        
        // Refresh offers
        fetchMyOffers();
        fetchMyGroupOffers();
      }
    } catch (error) {
      console.error('Counter response error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to respond to counter offer",
        variant: "destructive",
      });
    } finally {
      setSubmittingCounterResponse(false);
    }
  };

  // Handle refresh
  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      const promises = [fetchMyOffers(), fetchOpenRequests()];
      
      if (activeTab === "groups") {
        promises.push(fetchGroupRequests());
      }
      
      if (activeTab === "my-offers") {
        promises.push(fetchMyGroupOffers());
      }
      
      await Promise.all(promises);
      
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

  // Filter offers based on search query
  const filteredMyOffers = [...myOffers, ...myGroupOffers.map(offer => ({ ...offer, isGroupOffer: true }))].filter(offer =>
    offer.request?.item?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (offer.request?.vendor?.name || offer.groupRequest?.group?.leader?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
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
    } else if (activeTab === "my-offers") {
      fetchMyGroupOffers();
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

  const getOfferStatusConfig = (status: string): { 
  variant: "default" | "destructive" | "secondary" | "outline"; 
  color: string; 
  label: string; 
} => {
  switch (status) {
    case 'pending':
      return { variant: 'default' as const, color: 'text-primary', label: 'Pending' };
    case 'accepted':
      return { variant: 'secondary' as const, color: 'text-green-600', label: 'Accepted' };
    case 'rejected':
      return { variant: 'destructive' as const, color: 'text-red-600', label: 'Rejected' };
    case 'countered':
      return { variant: 'outline' as const, color: 'text-orange-600', label: 'Countered' };
    default:
      return { variant: 'secondary' as const, color: 'text-muted-foreground', label: status };
  }
};

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
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
            <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
              <TabsTrigger value="individual">Individual Requests</TabsTrigger>
              <TabsTrigger value="groups">Group Requests</TabsTrigger>
              <TabsTrigger value="my-offers">My Offers</TabsTrigger>
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

            {/* New My Offers Tab */}
            <TabsContent value="my-offers" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">My Offers</h2>
                <Badge variant="outline">{filteredMyOffers.length} offers</Badge>
              </div>
              
              {loadingOffers ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredMyOffers.map((offer) => {
                    const request = offer.request || offer.groupRequest;
                    const statusConfig = getOfferStatusConfig(offer.status);
                    const isGroupOffer = offer.isGroupOffer;
                    
                    return (
                      <Card key={offer._id} className="bg-gradient-card border-border/50 shadow-card">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                {isGroupOffer ? <Users className="w-5 h-5 text-primary" /> : <Package className="w-5 h-5 text-primary" />}
                              </div>
                              <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {request?.item || 'Unknown Item'}
                                  {isGroupOffer && <Badge variant="outline" className="text-xs">Group</Badge>}
                                </CardTitle>
                                <CardDescription className="flex items-center space-x-4 text-sm">
                                  <span className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {isGroupOffer 
                                      ? (request?.group?.leader?.name || 'Unknown Leader')
                                      : (request?.vendor?.name || 'Unknown Vendor')
                                    }
                                  </span>
                                  <span className="flex items-center">
                                    <Package className="w-3 h-3 mr-1" />
                                    {request?.quantity || 'Unknown Quantity'}
                                  </span>
                                  <span className="flex items-center">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {request?.location || 'Unknown Location'}
                                  </span>
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant={statusConfig.variant} className="flex items-center space-x-1">
                              <span className={statusConfig.color}>{statusConfig.label}</span>
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">My Offer</p>
                              <p className="text-lg font-semibold flex items-center">
                                <IndianRupee className="w-4 h-4 mr-1" />
                                {offer.offeredPrice}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Requested Price</p>
                              <p className="text-sm flex items-center">
                                <IndianRupee className="w-3 h-3 mr-1" />
                                {request?.desiredPrice || 'N/A'}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Delivery</p>
                              <p className="text-sm flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {offer.eta}
                              </p>
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm text-muted-foreground">Submitted</p>
                              <p className="text-sm flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(offer.createdAt)}
                              </p>
                            </div>
                          </div>

                          {offer.notes && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground">Notes</p>
                              <p className="text-sm">{offer.notes}</p>
                            </div>
                          )}

                          {offer.deliveryOptions && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-2">Delivery Options</p>
                              <div className="flex gap-2 flex-wrap">
                                {offer.deliveryOptions.canPickup && (
                                  <Badge variant="outline" className="text-xs">Customer Pickup</Badge>
                                )}
                                {offer.deliveryOptions.canDeliver && (
                                  <Badge variant="outline" className="text-xs">
                                    Delivery (₹{offer.deliveryOptions.deliveryCharge})
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {offer.status === 'countered' && (
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleCounterResponse(offer, 'accept')}
                                  >
                                    Accept Counter
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleCounterResponse(offer, 'counter')}
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Counter Again
                                  </Button>
                                </div>
                              )}
                              
                              {offer.status === 'accepted' && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Deal Completed
                                </Badge>
                              )}
                              
                              {offer.status === 'rejected' && (
                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Offer Rejected
                                </Badge>
                              )}
                            </div>
                            
                            <Button size="sm" variant="ghost">
                              <Eye className="w-4 h-4 mr-2" />
                              View {isGroupOffer ? 'Group' : 'Request'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
              
              {!loadingOffers && filteredMyOffers.length === 0 && (
                <Card className="bg-gradient-card border-border/50 shadow-card">
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No offers submitted</h3>
                    <p className="text-muted-foreground">
                      {searchQuery ? 
                        "No offers match your search criteria" : 
                        "You haven't submitted any offers yet. Browse requests to get started!"
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Counter Response Dialog */}
      <Dialog open={counterResponseDialog} onOpenChange={setCounterResponseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {counterResponseData.action === 'accept' ? 'Accept Counter Offer' : 'Send Counter Offer'}
            </DialogTitle>
            <DialogDescription>
              {counterResponseData.action === 'accept' 
                ? 'Accept the vendor\'s counter offer terms'
                : 'Send a new counter offer in response'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {counterResponseData.action === 'counter' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="response-price">Your Counter Price (₹) *</Label>
                    <Input
                      id="response-price"
                      type="number"
                      placeholder="Enter your price"
                      value={counterResponseData.offeredPrice}
                      onChange={(e) => setCounterResponseData(prev => ({
                        ...prev,
                        offeredPrice: e.target.value
                      }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="response-eta">Delivery Time *</Label>
                    <Input
                      id="response-eta"
                      placeholder="e.g., 3 days"
                      value={counterResponseData.eta}
                      onChange={(e) => setCounterResponseData(prev => ({
                        ...prev,
                        eta: e.target.value
                      }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-notes">Response Notes</Label>
                  <Textarea
                    id="response-notes"
                    placeholder="Explain your counter offer..."
                    value={counterResponseData.notes}
                    onChange={(e) => setCounterResponseData(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                    rows={3}
                  />
                </div>
              </>
            )}

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                {counterResponseData.action === 'accept' ? 'Accepting:' : 'Current Offer:'}
              </p>
              <p className="text-sm">
                <span className="font-medium">₹{selectedCounterOffer?.offeredPrice}</span> - {selectedCounterOffer?.eta}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCounterResponseDialog(false)}
              disabled={submittingCounterResponse}
            >
              Cancel
            </Button>
            <Button onClick={submitCounterResponse} disabled={submittingCounterResponse}>
              {submittingCounterResponse ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {counterResponseData.action === 'accept' ? 'Accepting...' : 'Sending...'}
                </>
              ) : (
                counterResponseData.action === 'accept' ? 'Accept Counter Offer' : 'Send Counter Offer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SupplierDashboard;
