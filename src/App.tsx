import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import HomePage from "@/pages/HomePage";
import CoursesPage from "@/pages/CoursesPage";
import ContactPage from "@/pages/ContactPage";
import EnrollPage from "@/pages/EnrollPage";
import FacultyPage from "@/pages/FacultyPage";
import StudentResultsPage from "@/pages/StudentResultsPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminEnrollments from "@/pages/admin/AdminEnrollments";
import AdminContacts from "@/pages/admin/AdminContacts";
import AdminResults from "@/pages/admin/AdminResults";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminFaculty from "@/pages/admin/AdminFaculty";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/enroll" element={<EnrollPage />} />
            <Route path="/faculty" element={<FacultyPage />} />
            <Route path="/results" element={<StudentResultsPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="enrollments" element={<AdminEnrollments />} />
              <Route path="contacts" element={<AdminContacts />} />
              <Route path="results" element={<AdminResults />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="faculty" element={<AdminFaculty />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
          <WhatsAppButton />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
