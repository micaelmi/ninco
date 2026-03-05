import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryList } from '@/components/manage/category-list';
import { TagList } from '@/components/manage/tag-list';
import { PreferencesForm } from '@/components/manage/preferences-form';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: 'Settings',
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
        <h1 className="mb-2 font-bold text-3xl">Settings</h1>
        <p className="mb-8 text-muted-foreground">
          Manage your personal preferences, categories, and tags used across all transactions.
        </p>

        <Tabs defaultValue="preferences" className="w-full">
          <TabsList className="grid grid-cols-3 w-full lg:w-[600px]">
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          <TabsContent value="preferences" className="mt-6">
            <PreferencesForm />
          </TabsContent>
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
