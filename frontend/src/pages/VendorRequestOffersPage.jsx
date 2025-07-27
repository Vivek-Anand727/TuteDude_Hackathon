import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, IndianRupee, Clock, User } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const backendURL = import.meta.env.VITE_BACKEND_URL;

const VendorRequestOffersPage = () => {
  console.log("📄 VendorRequestOffersPage component loaded");

  const { requestId } = useParams();
  console.log("🆔 RequestId from params:", requestId);

  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/${offerId}/accept`,
        {},
        getAuthHeaders()
      );

      if (res.data.success) {
        toast({
          title: "Success",
          description: "Offer accepted successfully!",
        });
        // Refresh offers
        fetchOffers();
      }
    } catch (error) {
      console.error("Accept offer error:", error);
      toast({
        title: "Error",
        description: "Failed to accept offer",
        variant: "destructive",
      });
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const res = await axios.post(
        `${backendURL}/api/offers/${offerId}/reject`,
        {},
        getAuthHeaders()
      );

      if (res.data.success) {
        toast({
          title: "Success",
          description: "Offer rejected successfully!",
        });
        // Refresh offers
        fetchOffers();
      }
    } catch (error) {
      console.error("Reject offer error:", error);
      toast({
        title: "Error",
        description: "Failed to reject offer",
        variant: "destructive",
      });
    }
  };

  const fetchOffers = async () => {
    console.log("🚀 fetchOffers function called!");
    try {
      setLoading(true);
      console.log("🔍 Fetching offers for requestId:", requestId);
      console.log(
        "🔗 API URL:",
        `${backendURL}/api/offers/request/${requestId}`
      );

      const res = await axios.get(
        `${backendURL}/api/offers/request/${requestId}`,
        getAuthHeaders()
      );

      console.log("📡 API Response:", res.data);

      if (res.data.success) {
        console.log("✅ Offers received:", res.data.offers);
        setOffers(res.data.offers || []);
      } else {
        console.log("❌ API call unsuccessful:", res.data);
      }
    } catch (error) {
      console.error("🚨 Fetch offers error:", error);
      console.log("🚨 Error response:", error.response?.data);
      toast({
        title: "Error",
        description: "Failed to fetch offers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔄 useEffect running, requestId:", requestId);
    if (requestId) {
      console.log("✅ About to call fetchOffers");
      fetchOffers();
    } else {
      console.log("❌ No requestId found");
    }
  }, [requestId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log("🔙 Navigating back to vendor dashboard");
                navigate("/vendor/dashboard");
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Request Offers
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {offers.length} {offers.length === 1 ? "Offer" : "Offers"}{" "}
              Received
            </h2>

            {offers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p>No offers received yet for this request.</p>
                </CardContent>
              </Card>
            ) : (
              offers.map((offer) => (
                <Card
                  key={offer._id}
                  className="bg-gradient-card border-border/50 shadow-card"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {offer.supplier.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {offer.supplier.email}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          offer.status === "pending"
                            ? "default"
                            : offer.status === "accepted"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {offer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Offered Price
                        </p>
                        <p className="text-lg font-semibold flex items-center">
                          <IndianRupee className="w-4 h-4 mr-1" />
                          {offer.offeredPrice}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Delivery Time
                        </p>
                        <p className="text-sm flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {offer.eta}
                        </p>
                      </div>
                    </div>

                    {offer.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">Notes</p>
                        <p className="text-sm">{offer.notes}</p>
                      </div>
                    )}

                    {offer.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOffer(offer._id)}
                        >
                          Accept Offer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectOffer(offer._id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorRequestOffersPage;
