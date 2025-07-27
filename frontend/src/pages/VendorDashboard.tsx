"use client";
import ChatBot from "@/components/ChatBot";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Package,
  Users,
  TrendingUp,
  CheckCircle,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  Eye,
  UserPlus,
  LogOut,
  Crown,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import CreateRequestDialog from "@/components/vendor/CreateRequestDialog";
import CreateGroupDialog from "@/components/vendor/CreateGroupDialog";
import RequestCard from "@/components/vendor/RequestCard";
import GroupCard from "@/components/vendor/GroupCard";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [isCreateRequestOpen, setIsCreateRequestOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("requests");

  const [stats, setStats] = useState({
    activeRequests: 0,
    totalOffers: 0,
    acceptedDeals: 0,
    groupsJoined: 0,
  });

  const [requests, setRequests] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [groupRequests, setGroupRequests] = useState([]);
  
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingAvailableGroups, setLoadingAvailableGroups] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    };
  };

  // ✅ Enhanced error handler
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

  // ✅ Check authentication
  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (!token || role !== "vendor") {
      navigate("/auth?role=vendor");
      return false;
    }
    return true;
  };

  // ✅ Update stats calculation to include groups count
  const updateStats = (requestsData = null, groupsData = null) => {
    setStats(prevStats => {
      const newStats = { ...prevStats };
      
      // Update groups joined count if groups data is provided
      if (groupsData !== null) {
        newStats.groupsJoined = groupsData.length;
      }
      
      // Update request-related stats if requests data is provided
      if (requestsData !== null) {
        const openRequests = requestsData.filter(req => req.status === 'open').length;
        const fulfilledRequests = requestsData.filter(req => req.status === 'fulfilled').length;
        const totalOffers = requestsData.reduce((sum, req) => sum + (req.offersCount || 0), 0);
        
        newStats.activeRequests = openRequests;
        newStats.acceptedDeals = fulfilledRequests;
        newStats.totalOffers = totalOffers;
      }
      
      return newStats;
    });
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        `${backendURL}/api/requests/stats/dashboard`,
        getAuthHeaders()
      );

      if (res.data.success) {
        const data = res.data.stats;
        setStats(prevStats => ({
          ...prevStats,
          activeRequests: data.open || 0,
          totalOffers: data.totalOffersReceived || 0,
          acceptedDeals: data.fulfilled || 0,
          // Keep existing groupsJoined count if we have it
        }));
      }
    } catch (err) {
      handleApiError(err, 'Stats fetch');
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get(
        `${backendURL}/api/requests/my-requests`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        const requestsData = res.data.requests || [];
        setRequests(requestsData);
        // Update stats with requests data
        updateStats(requestsData, null);
      }
    } catch (err) {
      handleApiError(err, 'Requests fetch');
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoadingGroups(true);
      const res = await axios.get(
        `${backendURL}/api/groups/my-groups`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        const groupsData = res.data.groups || [];
        setGroups(groupsData);
        
        // Update stats with groups count
        updateStats(null, groupsData);
        
        // Fetch group requests for active groups
        const activeGroups = groupsData.filter(group => group.status === 'active');
        
        if (activeGroups.length > 0) {
          const groupRequestsPromises = activeGroups.map(async (group) => {
            try {
              const requestRes = await axios.get(
                `${backendURL}/api/groups/${group._id}/request`,
                getAuthHeaders()
              );
              return requestRes.data.success ? requestRes.data.groupRequest : null;
            } catch (err) {
              // 404 is expected for groups without requests
              if (err.response?.status !== 404) {
                console.error(`Error fetching request for group ${group._id}:`, err);
              }
              return null;
            }
          });

          const groupRequestsData = await Promise.all(groupRequestsPromises);
          setGroupRequests(groupRequestsData.filter(req => req !== null));
        } else {
          setGroupRequests([]);
        }
      }
    } catch (err) {
      handleApiError(err, 'Groups fetch');
    } finally {
      setLoadingGroups(false);
    }
  };

  const fetchAvailableGroups = async () => {
    setLoadingAvailableGroups(true);
    try {
      const res = await axios.get(
        `${backendURL}/api/groups/available`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        setAvailableGroups(res.data.groups || []);
      }
    } catch (err) {
      handleApiError(err, 'Available groups fetch');
    } finally {
      setLoadingAvailableGroups(false);
    }
  };

  const handleJoinGroup = async (groupId, quantity) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/groups/${groupId}/join`,
        { quantity },
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.message || "Successfully joined the group!",
        });
        
        // Refresh data
        fetchMyGroups();
        fetchAvailableGroups();
      }
    } catch (err) {
      handleApiError(err, 'Join group');
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/groups/${groupId}/leave`,
        {},
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.message,
        });
        
        // Refresh data
        fetchMyGroups();
      }
    } catch (err) {
      handleApiError(err, 'Leave group');
    }
  };

  const handleCreateGroupRequest = async (groupId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/groups/${groupId}/create-request`,
        {},
        getAuthHeaders()
      );
      
      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.message || "Group request created successfully!",
        });
        
        // Refresh data
        fetchMyGroups();
      }
    } catch (err) {
      handleApiError(err, 'Create group request');
    }
  };

  const handleViewOffers = (groupRequestId) => {
    navigate(`/vendor/group-offers/${groupRequestId}`);
  };

  const handleRefreshAll = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchRequests(),
        fetchMyGroups(),
        activeTab === "available-groups" ? fetchAvailableGroups() : Promise.resolve()
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

  useEffect(() => {
    if (!checkAuth()) return;
    
    // Setup axios defaults on component mount
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    // Fetch data in sequence to ensure proper stats calculation
    const fetchData = async () => {
      await fetchRequests();
      await fetchMyGroups();
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "available-groups") {
      fetchAvailableGroups();
    }
  }, [activeTab]);

  // Rest of your component remains exactly the same...
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Vendor Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshAll}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsCreateGroupOpen(true)}>
              <Users className="w-4 h-4 mr-2" />
              Create Group
            </Button>
            <Button size="sm" onClick={() => setIsCreateRequestOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Active Requests" value={stats.activeRequests} icon={<Package />} />
          <StatCard label="Total Offers" value={stats.totalOffers} icon={<TrendingUp />} />
          <StatCard label="Accepted Deals" value={stats.acceptedDeals} icon={<CheckCircle />} />
          <StatCard label="Groups Joined" value={stats.groupsJoined} icon={<Users />} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="requests">My Requests</TabsTrigger>
            <TabsTrigger value="groups">My Groups</TabsTrigger>
            <TabsTrigger value="available-groups">Join Groups</TabsTrigger>
            <TabsTrigger value="group-requests">Group Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {loadingRequests ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : requests.length > 0 ? (
              <div className="grid gap-4">
                {requests.map((request) => (
                  <RequestCard key={request._id} request={request} />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No requests yet"
                description="Create your first request to start receiving offers from suppliers"
                onClick={() => setIsCreateRequestOpen(true)}
                buttonLabel="Create First Request"
              />
            )}
          </TabsContent>

          <TabsContent value="groups" className="space-y-4">
            {loadingGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : groups.length > 0 ? (
              <div className="grid gap-4">
                {groups.map((group) => (
                  <GroupManagementCard 
                    key={group._id} 
                    group={group} 
                    onLeaveGroup={handleLeaveGroup}
                    onCreateRequest={handleCreateGroupRequest}
                    onViewOffers={handleViewOffers}
                    groupRequest={groupRequests.find(req => req?.group?._id === group._id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No groups joined"
                description="Create or join a group to start negotiating in bulk"
                onClick={() => setIsCreateGroupOpen(true)}
                buttonLabel="Create Group"
              />
            )}
          </TabsContent>

          <TabsContent value="available-groups" className="space-y-4">
            {loadingAvailableGroups ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : availableGroups.length > 0 ? (
              <div className="grid gap-4">
                {availableGroups.map((group) => (
                  <AvailableGroupCard 
                    key={group._id} 
                    group={group} 
                    onJoinGroup={handleJoinGroup}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No available groups"
                description="There are currently no groups available to join"
                onClick={fetchAvailableGroups}
                buttonLabel="Refresh"
              />
            )}
          </TabsContent>
 <div className="min-h-screen bg-background">
        {/* Your existing dashboard content */}
        {/* ... all your existing JSX ... */}
      </div>
      
      {/* Add ChatBot */}
      <ChatBot />
          <TabsContent value="group-requests" className="space-y-4">
            {groupRequests.length > 0 ? (
              <div className="grid gap-4">
                {groupRequests.map((groupRequest) => (
                  <GroupRequestCard 
                    key={groupRequest._id} 
                    groupRequest={groupRequest}
                    onViewOffers={handleViewOffers}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No group requests"
                description="Create a group request to start receiving offers from suppliers"
                onClick={() => setActiveTab("groups")}
                buttonLabel="Go to My Groups"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Updated dialog components with proper onOpenChange handlers */}
      <CreateRequestDialog 
        open={isCreateRequestOpen} 
        onOpenChange={(open) => {
          setIsCreateRequestOpen(open);
          if (!open && isCreateRequestOpen) {
            fetchRequests();
          }
        }}
      />
      <CreateGroupDialog 
        open={isCreateGroupOpen} 
        onOpenChange={(open) => {
          setIsCreateGroupOpen(open);
          if (!open && isCreateGroupOpen) {
            fetchMyGroups();
          }
        }}
        
      />
    </div>
  );
};

export default VendorDashboard;

// All the other components (StatCard, GroupManagementCard, etc.) remain exactly the same...
const StatCard = ({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) => (
  <Card className="bg-gradient-card border-border/50 shadow-card">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Group Management Card
const GroupManagementCard = ({ group, onLeaveGroup, onCreateRequest, onViewOffers, groupRequest }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const currentUserId = localStorage.getItem("userId");
  const isLeader = group.leader._id === currentUserId;
  const canCreateRequest = isLeader && group.status === 'forming' && !groupRequest;

  const handleLeaveGroup = async () => {
    setIsLeaving(true);
    try {
      await onLeaveGroup(group._id);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleCreateRequest = async () => {
    setIsCreatingRequest(true);
    try {
      await onCreateRequest(group._id);
    } finally {
      setIsCreatingRequest(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {group.name}
              {isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          </div>
          <Badge variant={group.status === 'forming' ? 'default' : group.status === 'active' ? 'secondary' : 'outline'}>
            {group.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>{group.item}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span>{group.totalQuantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>₹{group.desiredPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{group.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">
            {group.members.length}/{group.maxMembers} members
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Leader:</span>
          <span className="text-sm">{group.leader.name}</span>
        </div>

        {group.expiresAt && (
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              Expires: {new Date(group.expiresAt).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {canCreateRequest && (
            <Button 
              size="sm" 
              onClick={handleCreateRequest}
              disabled={isCreatingRequest}
              className="flex-1"
            >
              {isCreatingRequest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Request
                </>
              )}
            </Button>
          )}
          
          {groupRequest && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewOffers(groupRequest._id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Offers ({groupRequest.offersCount || 0})
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={handleLeaveGroup}
            disabled={isLeaving}
          >
            {isLeaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Leaving...
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Available Group Card
const AvailableGroupCard = ({ group, onJoinGroup }) => {
  const [quantity, setQuantity] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!quantity.trim()) {
      toast({
        title: "Error",
        description: "Please enter quantity to join",
        variant: "destructive",
      });
      return;
    }

    // Basic quantity validation
    const quantityRegex = /^\d+(\.\d+)?\s*[a-zA-Z]+$/;
    if (!quantityRegex.test(quantity.trim())) {
      toast({
        title: "Error",
        description: "Please enter quantity in format like '10kg' or '5.5tonnes'",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      await onJoinGroup(group._id, quantity.trim());
      setQuantity("");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{group.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
          </div>
          <Badge variant="outline">
            {group.members.length}/{group.maxMembers} members
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>{group.item}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>₹{group.desiredPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{group.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{new Date(group.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Leader:</span>
          <span className="text-sm">{group.leader.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">Current total: {group.totalQuantity}</span>
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Your quantity (e.g., 10kg)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="flex-1 bg-background text-foreground border-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoin();
              }
            }}
          />
          <Button 
            size="sm" 
            onClick={handleJoin}
            disabled={isJoining || !quantity.trim()}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Join
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Group Request Card
const GroupRequestCard = ({ groupRequest, onViewOffers }) => {
  const isExpired = new Date(groupRequest.expiresAt) < new Date();
  
  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {groupRequest.group.name} Request
              {isExpired && <AlertCircle className="w-4 h-4 text-red-500" />}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Group request for {groupRequest.item}
            </p>
          </div>
          <Badge 
            variant={
              groupRequest.status === 'active' && !isExpired ? 'default' : 
              groupRequest.status === 'completed' ? 'secondary' : 
              'destructive'
            }
          >
            {isExpired ? 'expired' : groupRequest.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span>{groupRequest.quantity}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>₹{groupRequest.desiredPrice}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{groupRequest.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span>{groupRequest.offersCount || 0} offers</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`} />
          <span className={`text-sm ${isExpired ? 'text-red-500 font-medium' : ''}`}>
            {isExpired ? 'Expired' : 'Expires'}: {new Date(groupRequest.expiresAt).toLocaleDateString()}
          </span>
        </div>

        <Button 
          size="sm" 
          className="w-full"
          onClick={() => onViewOffers(groupRequest._id)}
          disabled={isExpired}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Offers ({groupRequest.offersCount || 0})
        </Button>
      </CardContent>
    </Card>
  );
};

// Empty state card
const EmptyCard = ({
  title,
  description,
  onClick,
  buttonLabel,
}: {
  title: string;
  description: string;
  onClick: () => void;
  buttonLabel: string;
}) => (
  <Card className="bg-gradient-card border-border/50 shadow-card">
    <CardContent className="p-12 text-center">
      <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      <Button onClick={onClick}>
        <Plus className="w-4 h-4 mr-2" />
        {buttonLabel}
      </Button>
    </CardContent>
  </Card>
);
