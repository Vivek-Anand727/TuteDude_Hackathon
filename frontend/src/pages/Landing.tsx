import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Shield, 
  Play,
  ArrowRight,
  Check,
  Package,
  MessageSquare,
  IndianRupee,
  Clock,
  UserPlus,
  FileText,
  Eye,
  Star,
  Zap,
  DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SanchayKart Flex</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            
            {/* Tutorial Dialog */}
            <Dialog open={isTutorialOpen} onOpenChange={setIsTutorialOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-2xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                    How SanchayKart Flex Works
                  </DialogTitle>
                  <DialogDescription>
                    Learn how to use our revolutionary marketplace to get the best deals
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="vendors" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="vendors">For Vendors</TabsTrigger>
                    <TabsTrigger value="suppliers">For Suppliers</TabsTrigger>
                  </TabsList>

                  {/* Vendors Tutorial */}
                  <TabsContent value="vendors" className="space-y-6 mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">Street Vendor's Guide</h3>
                      <p className="text-muted-foreground">
                        Get raw materials at your preferred price through our dynamic bidding system
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Step 1 */}
                      <Card className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">1</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary" />
                              Post Your Request
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Create a request for what you need with your desired price and quantity
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Specify item (e.g., Tomatoes, Rice)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Set quantity (e.g., 50kg)</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Set your target price</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Add delivery location</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Step 2 */}
                      <Card className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">2</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              Receive Multiple Offers
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Suppliers compete to give you the best price and quality
                            </p>
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <div className="flex items-center justify-between text-sm">
                                <span>Supplier A offers:</span>
                                <span className="font-semibold text-green-600">₹45/kg</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Supplier B offers:</span>
                                <span className="font-semibold text-blue-600">₹42/kg</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span>Supplier C offers:</span>
                                <span className="font-semibold text-primary">₹40/kg ⭐</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Step 3 */}
                      <Card className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold">3</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <MessageSquare className="w-5 h-5 text-green-600" />
                              Negotiate & Accept
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Chat with suppliers, negotiate, and accept the best offer
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline">💬 Chat</Badge>
                              <Badge variant="outline">🔄 Counter Offer</Badge>
                              <Badge variant="outline">✅ Accept Deal</Badge>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Group Buying */}
                      <Card className="p-6 border-orange-500/20 bg-orange-500/5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Star className="w-5 h-5 text-orange-600" />
                              Bonus: Group Buying Power
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Join with other vendors to get bulk discounts on larger quantities
                            </p>
                            {/* ✅ Removed the white background box */}
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              <strong>Example:</strong> 5 vendors each need 20kg rice → Join together for 100kg → Get ₹5/kg discount!
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Link to="/auth?role=vendor" className="flex-1">
                        <Button className="w-full">
                          Start as Vendor
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>

                  {/* Suppliers Tutorial */}
                  <TabsContent value="suppliers" className="space-y-6 mt-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">Supplier's Guide</h3>
                      <p className="text-muted-foreground">
                        Expand your business by bidding on vendor requests and group orders
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Step 1 */}
                      <Card className="p-6 border-primary/20 bg-primary/5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold">1</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-primary" />
                              Browse Requests
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              View all vendor requests and filter by location, item type, and quantity
                            </p>
                            <div className="bg-muted/30 p-3 rounded-lg text-sm">
                              <div className="flex justify-between mb-1">
                                <span>📍 Mumbai - Tomatoes 50kg</span>
                                <span className="text-primary font-semibold">Target: ₹15/kg</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>📍 Delhi - Rice 100kg</span>
                                <span className="text-primary font-semibold">Target: ₹45/kg</span>
                              </div>
                              <div className="flex justify-between">
                                <span>📍 Bangalore - Onions 30kg</span>
                                <span className="text-primary font-semibold">Target: ₹20/kg</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Step 2 */}
                      <Card className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold">2</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <IndianRupee className="w-5 h-5 text-blue-600" />
                              Make Competitive Offers
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Submit your best price, delivery time, and quality specifications
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Set your price per kg</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Mention delivery options</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Add quality details</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-600" />
                                <span>Set delivery timeline</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* Step 3 */}
                      <Card className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-green-600 font-bold">3</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-green-600" />
                              Win Deals & Deliver
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Get selected by vendors and complete deliveries to build your reputation
                            </p>
                            {/* ✅ Removed the white background box */}
                            <p className="text-sm text-green-700 dark:text-green-300">
                              <strong>Success Rate:</strong> Higher success rate = More visibility in vendor searches
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Group Orders */}
                      <Card className="p-6 border-orange-500/20 bg-orange-500/5">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                              <Star className="w-5 h-5 text-orange-600" />
                              Big Opportunity: Group Orders
                            </h4>
                            <p className="text-muted-foreground mb-3">
                              Bid on large group orders for higher profits and bulk sales
                            </p>
                            {/* ✅ Removed the white background box */}
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              <strong>Example:</strong> Group order of 500kg rice → Higher volume = Better margins for you
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Link to="/auth?role=supplier" className="flex-1">
                        <Button className="w-full">
                          Start as Supplier
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* ✅ Updated Benefits Section - Removed white background and updated text */}
                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                  <h4 className="text-lg font-semibold mb-3 text-center">Why Choose SanchayKart Flex?</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>100% Transparent - No Hidden Costs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Real-time Negotiations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-orange-600" />
                      <span>Group Buying Power</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span>Best Market Prices</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </nav>
        </div>
      </header>

      {/* Rest of the component remains the same... */}
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <Badge variant="outline" className="mb-6">
              🚀 Revolutionary Marketplace
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              Vendors set their price,
              <br />
              Suppliers make offers
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              The first dynamic bidding marketplace for street vendors. Get raw materials at your preferred price through real-time negotiations and group buying.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?role=vendor">
                <Button size="lg" className="w-full sm:w-auto">
                  I'm a Vendor
                </Button>
              </Link>
              <Link to="/auth?role=supplier">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  I'm a Supplier
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How SanchayKart Flex Works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Post Your Request</h3>
              <p className="text-sm text-muted-foreground">
                Vendors post what they need with their desired price and quantity
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Receive Offers</h3>
              <p className="text-sm text-muted-foreground">
                Suppliers browse and make competitive offers with their best prices
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Group Buying</h3>
              <p className="text-sm text-muted-foreground">
                Form groups to negotiate better prices and split bulk orders
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 shadow-card hover:shadow-glow transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Secure Deals</h3>
              <p className="text-sm text-muted-foreground">
                Complete transactions with confidence through our secure platform
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-card">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of vendors and suppliers who are already using SanchayKart Flex to get better deals.
          </p>
          <Button 
            size="lg" 
            className="shadow-glow"
            onClick={() => setIsTutorialOpen(true)}
          >
            <Play className="w-4 h-4 mr-2" />
            Learn How It Works
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 SanchayKart Flex. Revolutionizing vendor-supplier connections.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
