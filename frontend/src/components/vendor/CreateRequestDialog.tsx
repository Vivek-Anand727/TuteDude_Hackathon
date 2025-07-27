"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Package, Loader2 } from "lucide-react";

const backendURL = import.meta.env.VITE_BACKEND_URL;

interface CreateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateRequestDialog = ({ open, onOpenChange }: CreateRequestDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    item: "",
    description: "",
    quantity: "",
    desiredPrice: "",
    location: "",
    urgency: "medium",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  const validateForm = () => {
    const { item, quantity, desiredPrice, location } = formData;
    
    if (!item.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!quantity.trim()) {
      toast({
        title: "Error",
        description: "Quantity is required",
        variant: "destructive",
      });
      return false;
    }

    // Validate quantity format (e.g., "50kg", "10tonnes")
    const quantityRegex = /^\d+(\.\d+)?\s*[a-zA-Z]+$/;
    if (!quantityRegex.test(quantity.trim())) {
      toast({
        title: "Error",
        description: "Please enter quantity in format like '50kg' or '10tonnes'",
        variant: "destructive",
      });
      return false;
    }

    if (!desiredPrice || Number(desiredPrice) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid desired price",
        variant: "destructive",
      });
      return false;
    }

    if (!location.trim()) {
      toast({
        title: "Error",
        description: "Location is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      console.log("🚀 Creating request with data:", formData);
      
      const response = await axios.post(
        `${backendURL}/api/requests/create`,
        {
          ...formData,
          desiredPrice: Number(formData.desiredPrice),
        },
        getAuthHeaders()
      );

      console.log("✅ Request created successfully:", response.data);

      if (response.data.success) {
        toast({
          title: "Success",
          description: response.data.message || "Request created successfully!",
        });

        // Reset form
        setFormData({
          item: "",
          description: "",
          quantity: "",
          desiredPrice: "",
          location: "",
          urgency: "medium",
        });

        // Close dialog
        onOpenChange(false);
      }
    } catch (error: any) {
      console.error("❌ Error creating request:", error);
      console.error("Response:", error.response?.data);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to create request";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Create New Request
          </DialogTitle>
          <DialogDescription>
            Create a request to get quotes from suppliers for your required items.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item">Item Name *</Label>
              <Input
                id="item"
                type="text"
                placeholder="e.g., Basmati Rice"
                value={formData.item}
                onChange={(e) => handleInputChange("item", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="text"
                placeholder="e.g., 50kg"
                value={formData.quantity}
                onChange={(e) => handleInputChange("quantity", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the item..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desiredPrice">Desired Price (₹/kg) *</Label>
              <Input
                id="desiredPrice"
                type="number"
                placeholder="e.g., 100"
                value={formData.desiredPrice}
                onChange={(e) => handleInputChange("desiredPrice", e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <Select
                value={formData.urgency}
                onValueChange={(value) => handleInputChange("urgency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Delhi, Mumbai"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Post Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRequestDialog;
