import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, CreditCard, UserPlus, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RoadmapDisplay, RoadmapData } from "@/components/roadmap/RoadmapDisplay";
import { ReportDisplay } from "@/components/report/ReportDisplay";
import { calculateAssessmentResults } from "@/lib/scoringUtils";
import { transformResultsToReportData } from "@/data/reportData";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  referred_by: string | null;
  has_paid: boolean;
  created_at: string;
  roadmap_data?: RoadmapData | null;
}

const ADMIN_EMAIL = "gurbaazsingh411@gmail.com";

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [validCodes, setValidCodes] = useState<{code: string, created_at: string}[]>([]);
  const [newCode, setNewCode] = useState("");
  const [creatingCode, setCreatingCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [assessments, setAssessments] = useState<Record<string, any>>({});
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.email !== ADMIN_EMAIL) {
        navigate("/");
      } else {
        fetchData();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch all profiles
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, email, referred_by, has_paid, roadmap_data")
      .order("full_name", { ascending: true });

    if (!profileError && profileData) {
      setProfiles(profileData as Profile[]);
    }

    const { data: assessmentData } = await supabase
      .from("assessments")
      .select("user_id, answers");
      
    if (assessmentData) {
      const astMap: Record<string, any> = {};
      assessmentData.forEach((ast) => {
        if (ast.answers) {
          astMap[ast.user_id] = ast.answers;
        }
      });
      setAssessments(astMap);
    }

    // Fetch valid referral codes
    const { data: codeData, error: codeError } = await supabase
      .from("referral_codes")
      .select("code, created_at")
      .order("created_at", { ascending: false });

    if (!codeError && codeData) {
      setValidCodes(codeData);
    }

    setLoading(false);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCreatingCode(true);

    const formattedCode = newCode.toUpperCase().trim();
    
    const { error } = await supabase
      .from("referral_codes")
      .insert({ code: formattedCode });
      
    if (error) {
      toast.error(error.message || "Failed to create code");
    } else {
      toast.success("Referral code created successfully!");
      setNewCode("");
      fetchData();
    }
    setCreatingCode(false);
  };

  const totalUsers = profiles.length;
  const totalPaid = profiles.filter(p => p.has_paid).length;
  const totalRevenue = totalPaid * 50000; // Assuming Rs. 50,000 per user based on previous codebase

  // Group by referral code
  const referralStats: Record<string, { signups: number; paid: number }> = {};
  
  // Initialize with all valid codes from DB
  validCodes.forEach(vc => {
    referralStats[vc.code] = { signups: 0, paid: 0 };
  });

  profiles.forEach((p) => {
    const code = p.referred_by || "Organic (No Code)";
    if (!referralStats[code]) {
      referralStats[code] = { signups: 0, paid: 0 };
    }
    referralStats[code].signups += 1;
    if (p.has_paid) referralStats[code].paid += 1;
  });

  const referralArray = Object.entries(referralStats).map(([code, stats]) => ({
    code,
    ...stats,
  })).sort((a, b) => b.signups - a.signups);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin & Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track student registrations, payments, and sales executive performance.</p>
          </div>
          <Button onClick={fetchData} variant="outline" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh Data"}
          </Button>
        </div>

        {/* Top Level Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Students signed up</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Converted (Paid)</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPaid}</div>
              <p className="text-xs text-muted-foreground">Successfully purchased</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Based on current tracked payments</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Referral / Sales Exec Stats */}
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Sales Executive Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                <h3 className="text-sm font-semibold mb-3">Create New Referral Code</h3>
                <form onSubmit={handleCreateCode} className="flex gap-2">
                  <Input
                    placeholder="Enter new code (e.g., SUMMER2026)"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="uppercase"
                  />
                  <Button type="submit" disabled={creatingCode || !newCode.trim()}>
                    {creatingCode ? "Adding..." : "Add Code"}
                  </Button>
                </form>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referral Code</TableHead>
                    <TableHead className="text-right">Signups</TableHead>
                    <TableHead className="text-right">Paid Conversions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referralArray.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No referral data found
                      </TableCell>
                    </TableRow>
                  )}
                  {referralArray.map((row) => (
                    <TableRow key={row.code}>
                      <TableCell className="font-medium">{row.code}</TableCell>
                      <TableCell className="text-right">{row.signups}</TableCell>
                      <TableCell className="text-right">{row.paid}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Directory */}
          <Card className="col-span-1 shadow-md">
            <CardHeader>
              <CardTitle>Recent Student Directory</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Referred By</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        No student data found
                      </TableCell>
                    </TableRow>
                  )}
                  {profiles.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedProfile(p)}>
                      <TableCell>
                        <div className="font-medium">{p.full_name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{p.email}</div>
                      </TableCell>
                      <TableCell>{p.referred_by || <span className="text-muted-foreground text-xs">Organic</span>}</TableCell>
                      <TableCell className="text-right">
                        {p.has_paid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                            Unpaid
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Student Detail Modal */}
        <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedProfile?.full_name}'s Profile</DialogTitle>
              <DialogDescription>
                {selectedProfile?.email}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProfile && (
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <p className="font-semibold">{selectedProfile.has_paid ? "Paid" : "Unpaid"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Referred By</p>
                    <p className="font-semibold">{selectedProfile.referred_by || "Organic"}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Assessment</p>
                    <p className="font-semibold">{Object.keys(assessments[selectedProfile.id] || {}).length} / 75 Qs</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-semibold">{Math.round(((Object.keys(assessments[selectedProfile.id] || {}).length) / 75) * 100)}%</p>
                  </div>
                </div>

                {selectedProfile.roadmap_data ? (
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-semibold mb-4">Generated Roadmap</h3>
                    <div className="scale-[0.98] origin-top bg-muted/10 rounded-lg border p-2">
                      <RoadmapDisplay data={selectedProfile.roadmap_data} />
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
                    <p>No roadmap generated yet.</p>
                  </div>
                )}

                {Object.keys(assessments[selectedProfile.id] || {}).length >= 75 ? (
                  <div className="mt-8 border-t pt-8">
                    <h3 className="text-xl font-semibold mb-4">Assessment Report</h3>
                    <div className="scale-[0.98] origin-top bg-muted/10 rounded-lg border p-2 overflow-y-auto max-h-[600px]">
                      <ReportDisplay 
                        data={transformResultsToReportData(
                          calculateAssessmentResults(assessments[selectedProfile.id]), 
                          selectedProfile.full_name || "Student"
                        )} 
                        hideCTA={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 border-t pt-8 text-center text-muted-foreground">
                    <p>Assessment not completed yet.</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

      </motion.div>
    </div>
  );
}
