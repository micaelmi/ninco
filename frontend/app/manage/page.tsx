import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryList } from '@/components/manage/category-list';
import { TagList } from '@/components/manage/tag-list';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Manage Categories & Tags',
};

export default async function ManagePage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col bg-background selection:bg-primary/20 min-h-screen font-mono text-foreground">
      <Header />
      
      <main className="flex-1 mx-auto px-4 pt-24 pb-12 max-w-4xl container">
        <h1 className="mb-2 font-bold text-3xl">Manage Categories & Tags</h1>
        <p className="mb-8 text-muted-foreground">
          Create, update, or remove categories and tags. Changes will reflect across all transactions.
        </p>

        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid grid-cols-2 w-full lg:w-[400px]">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          <TabsContent value="categories" className="mt-6">
            <CategoryList />
          </TabsContent>
          <TabsContent value="tags" className="mt-6">
            <TagList />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
