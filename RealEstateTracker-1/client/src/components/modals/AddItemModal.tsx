import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { foodItemSchema, CompartmentEnum, CategoryEnum } from "@shared/schema";

interface AddItemModalProps {
  compartment?: string | null;
  onClose: () => void;
  initialData?: any;
  currentAccountId?: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  compartment,
  onClose,
  initialData,
  currentAccountId = "1",
}) => {
  const [open, setOpen] = useState(true);
  const { toast } = useToast();

  // 中文翻譯
  const translations = {
    title: "添加新食品",
    description: "請填寫食品資訊以添加到您的冰箱",
    itemName: "食品名稱",
    itemNamePlaceholder: "例如：牛奶、雞蛋等",
    category: "類別",
    expirationDate: "有效期限",
    compartment: "存放位置",
    cancel: "取消",
    add: "添加食品",
    successTitle: "新增成功",
    successDescription: "食品已成功添加到您的冰箱",
    errorTitle: "錯誤",
    errorDescription: "添加食品失敗，請重試"
  };

  // Parse initialData and set default values
  const getDefaultValues = () => {
    const today = new Date();
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setDate(today.getDate() + 7); // Default to 7 days from now

    if (initialData) {
      return {
        name: initialData.name || "",
        category: initialData.category || "Dairy",
        expiryDate: initialData.expiryDate || defaultExpiryDate.toISOString().slice(0, 10),
        compartment: compartment || "頂層架",
      };
    }

    return {
      name: "",
      category: "乳製品",
      expiryDate: defaultExpiryDate.toISOString().slice(0, 10),
      compartment: compartment || "頂層架",
    };
  };

  const form = useForm({
    resolver: zodResolver(foodItemSchema),
    defaultValues: getDefaultValues(),
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const onSubmit = async (data: any) => {
    try {
      console.log("前端發送的數據:", data);
      await apiRequest("POST", "/api/food-items", data);
      toast({
        title: translations.successTitle,
        description: translations.successDescription,
      });
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/food-items'] });
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/compartment'] });
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring/3'] }); // 即將到期查詢
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring/5'] });
      queryClient.invalidateQueries({ queryKey: ['/api/food-items/expiring/30'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
      
      handleClose();
    } catch (error) {
      toast({
        title: translations.errorTitle,
        description: translations.errorDescription,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{translations.title}</DialogTitle>
          <DialogDescription>{translations.description}</DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.itemName}</FormLabel>
                  <FormControl>
                    <Input placeholder={translations.itemNamePlaceholder} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.category}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇類別" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CategoryEnum.enum).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.expirationDate}</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={typeof field.value === 'string' 
                        ? field.value 
                        : field.value instanceof Date 
                          ? field.value.toISOString().slice(0, 10) 
                          : ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="compartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{translations.compartment}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇存放位置" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(CompartmentEnum.enum).map((comp) => (
                        <SelectItem key={comp} value={comp}>
                          {comp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="mr-2"
              >
                {translations.cancel}
              </Button>
              <Button type="submit">
                {translations.add}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemModal;
