import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleInstance } from "./sections/SingleInstance";
import { MultiInstance } from "./sections/MultiInstance";

export function ChatInterface() {
  return (
    <Tabs defaultValue="multi" className="w-full h-full relative">
      {/* <TabsList className="absolute left-4 top-4 w-auto grid grid-cols-2 gap-1 z-10">
        <TabsTrigger value="single" className="px-4">Single Instance</TabsTrigger>
        <TabsTrigger value="multi" className="px-4">Multi Instance</TabsTrigger>
      </TabsList> */}
      <TabsContent value="single" className="h-full mt-0">
        <SingleInstance />
      </TabsContent>
      <TabsContent value="multi" className="h-full mt-0">
        <MultiInstance />
      </TabsContent>
    </Tabs>
  );
}
