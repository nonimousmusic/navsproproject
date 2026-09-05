import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { ProgressSnapshot } from "@/components/dashboard/ProgressSnapshot";

import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileForm, setShowProfileForm] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        const { data: assessmentData } = await supabase
          .from("assessments")
          .select("answers")
          .eq("user_id", user.id)
          .maybeSingle();

        if (assessmentData && assessmentData.answers) {
          const answeredCount = Object.keys(assessmentData.answers).length;
          const percent = Math.min(100, (answeredCount / 75) * 100);
          setProgress(percent);
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(profileData);

        if (!profileData || !profileData.phone || !profileData.grade || !profileData.city_state) {
          setShowProfileForm(true);
        }

      } catch (e) {
        console.error("Error fetching dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [user]);

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Student";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />

        <main className="flex-1 overflow-auto">
          {/* Header with trigger */}
          <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-4">
            <SidebarTrigger className="shrink-0" />
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>
          </header>

          {/* Dashboard content */}
          <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <AnimatePresence>
              {showProfileForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                >
                  <ProfileForm
                    initialData={profile}
                    onComplete={() => setShowProfileForm(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <WelcomeBanner userName={userName} />

            <ProgressSnapshot progressPercentage={progress} />


          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
