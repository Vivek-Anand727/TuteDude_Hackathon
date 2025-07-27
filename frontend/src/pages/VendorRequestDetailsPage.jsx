import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, IndianRupee, Clock, User, Package, MapPin, Calendar, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const VendorRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    };
  };

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      // You might need to create this endpoint or get it from your existing requests
      const res = await axios.get(
        `${backendURL}/api/requests/${requestId}`,
        getAuthHeaders()
      );
      
      if (res.data.success) {
        setRequest(res.data.request);
      }
    } catch (error) {
      console.error('Fetch request details error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch request details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const getStatusConfig = (status) => {
    switch (status) {
      case "open":
        return { variant: "default", icon: Clock, color: "text-primary", label: "Open" };
      case "fulfilled":
        return { variant: "secondary", icon: AlertCircle, color: "text-green-600", label: "Fulfilled" };
      case "expired":
        return { variant: "destructive", icon: AlertCircle, color: "text-red-600", label: "Expired" };
      default:
        return { variant: "secondary", icon: Clock, color: "text-muted-foreground", label: status };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2">Request not found</h3>
            <Button onClick={() => navigate('/vendor/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/vendor/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Request Details</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{request.item}</CardTitle>
                  <p className="text-muted-foreground">Request ID: {request._id}</p>
                </div>
              </div>
              <Badge variant={statusConfig.variant} className="flex items-center space-x-2">
                <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
                <span>{statusConfig.label}</span>
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Basic Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">QUANTITY NEEDED</h3>
                <p className="text-lg font-medium flex items-center">
                  <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                  {request.quantity}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">DESIRED PRICE</h3>
                <p className="text-lg font-medium flex items-center">
                  <IndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
                  {request.desiredPrice}/kg
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">LOCATION</h3>
                <p className="text-lg font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  {request.location}
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">POSTED ON</h3>
                <p className="text-lg font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  {formatDate(request.createdAt)}
                </p>
              </div>
              
              {request.urgency && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-muted-foreground">URGENCY</h3>
                  <Badge variant="outline" className="capitalize">
                    {request.urgency}
                  </Badge>
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">OFFERS RECEIVED</h3>
                <p className="text-lg font-medium text-primary">
                  {request.offersCount || 0} offers
                </p>
              </div>
            </div>

            {/* Description */}
            {request.description && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground">DESCRIPTION</h3>
                <p className="text-base leading-relaxed bg-muted p-4 rounded-lg">
                  {request.description}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              {request.status === "open" && request.offersCount > 0 && (
                <Button onClick={() => navigate(`/vendor/offers/${request._id}`)}>
                  View Offers ({request.offersCount})
                </Button>
              )}
              
              {request.status === "fulfilled" && request.acceptedPrice && (
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Deal Completed
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Final Price: ₹{request.acceptedPrice}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorRequestDetailsPage;
