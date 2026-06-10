import { useState, useEffect } from "react";
import { 
  getDocs, 
  collection, 
  query, 
  orderBy, 
  doc, 
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { db, auth, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  Download, 
  LogOut, 
  Search,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Lock,
  User as UserIcon,
  Stethoscope,
  Activity,
  Trash2,
  HelpCircle,
  Mail,
  Key
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { downloadQuestionnairePDF } from "@/src/utils/pdfGenerator";

type Booking = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  service: string;
  preferredTime: string;
  preferredDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Timestamp;
  dob?: string;
  adminNote?: string;
};

type Questionnaire = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  date: string;
  createdAt: Timestamp;
  dob?: string;
  formType?: string;
  formCategory?: string;
  [key: string]: any;
};

type FAQSubmission = {
  id: string;
  email: string;
  question: string;
  createdAt: Timestamp;
  status?: 'pending' | 'responded';
  answer?: string;
  respondedAt?: Timestamp;
};

export default function Admin() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [faqs, setFaqs] = useState<FAQSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'questionnaires' | 'faqs'>('bookings');
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedItem, setSelectedItem] = useState<Booking | Questionnaire | FAQSubmission | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Email & Password Auth states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Custom response logic inside details drawer for FAQs
  const [isReplying, setIsReplying] = useState(false);
  const [replyMsg, setReplyMsg] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Communication Modal State
  const [commModal, setCommModal] = useState<{
    show: boolean,
    type: 'confirm' | 'cancel',
    booking: Booking | null
  }>({ show: false, type: 'confirm', booking: null });
  const [customMsg, setCustomMsg] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (successMsg || actionError) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, actionError]);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Strictly only allow admin@lalokhumed.co.za
        if (user.email === 'admin@lalokhumed.co.za') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    setLoginError(null);
    try {
      if (!auth) {
        throw new Error("Firebase Auth is currently not initialized. Please ensure your browser supports storage/cookies, or refresh the page.");
      }
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/unauthorized-domain') {
        setLoginError("This domain is not authorized in Firebase. Please add your Netlify domain to the Authorized Domains list in the Firebase Console.");
      } else {
        setLoginError(error.message || "An error occurred during sign in.");
      }
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!auth) {
      setLoginError("Firebase Auth is currently not initialized.");
      return;
    }
    if (!email || !password) {
      setLoginError("Please enter both email and password.");
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();
    if (sanitizedEmail !== "admin@lalokhumed.co.za") {
      setLoginError("Access Denied: Invalid administrator credentials or unauthorized account.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
    } catch (error: any) {
      console.error("Email authentication failed:", error);
      if (error.code === 'auth/operation-not-allowed') {
        setLoginError("Email/Password auth is not enabled in your Firebase project. Please enable 'Email/Password' provider inside the Firebase console under Authentication > Sign-in method.");
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        setLoginError("Invalid credentials. Please verify your administrator username and password.");
      } else if (error.code === 'auth/wrong-password') {
        setLoginError("Incorrect password. Please verify your credentials and try again.");
      } else {
        setLoginError(error.message || "Email authentication failed.");
      }
    }
  };

  const logout = () => {
    if (auth) {
      signOut(auth);
    }
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      // Fetch Bookings
      const bookingsSnap = await getDocs(query(collection(db, "bookings"), orderBy("createdAt", "desc")));
      const bookingsData = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);

      // Fetch Questionnaires
      const questionnairesSnap = await getDocs(query(collection(db, "questionnaires"), orderBy("createdAt", "desc")));
      const questionnairesData = questionnairesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Questionnaire));
      setQuestionnaires(questionnairesData);

      // Fetch FAQ Submissions
      const faqsSnap = await getDocs(query(collection(db, "faq_submissions"), orderBy("createdAt", "desc")));
      const faqsData = faqsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as FAQSubmission));
      setFaqs(faqsData);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const initiateAction = (item: Booking, type: 'confirm' | 'cancel') => {
    let defaultMsg = "";
    if (type === 'confirm') {
      defaultMsg = `Hello ${item.fullName}, your booking for ${item.service} on ${item.preferredDate} at ${item.preferredTime} is CONFIRMED. We look forward to seeing you.`;
    } else {
      defaultMsg = `Hello ${item.fullName}, we are unable to fulfill your booking for ${item.service} on ${item.preferredDate}. [Add suggestion or reason here]`;
    }
    
    setCustomMsg(defaultMsg);
    setCommModal({ show: true, type, booking: item });
  };

  const handleSendCommunication = async (sendVia: 'headless' | 'whatsapp') => {
    if (!commModal.booking) return;
    setIsSending(true);
    
    const item = commModal.booking;
    const status = commModal.type === 'confirm' ? 'confirmed' : 'cancelled';

    try {
      // 1. Update Booking Status
      await updateDoc(doc(db, "bookings", item.id), { 
        status,
        adminNote: customMsg,
        updatedAt: serverTimestamp() 
      });
      
      // 2. Manage availability if confirmed
      const availabilityRef = doc(db, "availability", item.id);
      if (status === 'confirmed') {
        await setDoc(availabilityRef, {
          date: item.preferredDate,
          time: item.preferredTime,
          bookingId: item.id
        });
      } else {
        await deleteDoc(availabilityRef);
      }

      // 3. WhatsApp Client Trigger (If selected)
      if (sendVia === 'whatsapp') {
        const cleanPhone = item.phone.replace(/\D/g, '');
        // Handle international prefix if missing (defaulting to ZA +27 for this context if needed, 
        // but often WhatsApp wa.me handles well if prefix is present or it detects location)
        const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMsg)}`;
        window.open(waLink, '_blank');
      }

      // 4. Queue Notification for Background Automation Service
      await setDoc(doc(collection(db, "notifications")), {
        bookingId: item.id,
        patientEmail: item.email,
        patientPhone: item.phone,
        message: customMsg,
        type: commModal.type,
        method: sendVia,
        status: 'queued',
        timestamp: serverTimestamp()
      });

      // Update Local State
      setBookings(prev => prev.map(b => b.id === item.id ? { ...b, status, adminNote: customMsg } : b));
      if (selectedItem && selectedItem.id === item.id) {
        setSelectedItem({ ...selectedItem, status, adminNote: customMsg } as Booking);
      }

      setCommModal({ show: false, type: 'confirm', booking: null });
      setCustomMsg("");
    } catch (error) {
      console.error("Communication Error:", error);
      handleFirestoreError(error, OperationType.UPDATE, "admin/communication");
    } finally {
      setIsSending(false);
    }
  };

  const deleteBooking = async (id: string) => {
    setIsDeleting(id);
    setActionError(null);
    setSuccessMsg(null);
    
    console.log(`Starting deletion for booking ID: ${id}`);
    
    try {
      // 1. Delete booking document
      await deleteDoc(doc(db, "bookings", id));
      console.log("Booking document deleted successfully");
      
      // 2. Clear availability
      await deleteDoc(doc(db, "availability", id));
      console.log("Availability record cleared successfully");
      
      // 3. Update local state
      setBookings(prev => prev.filter(b => b.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      
      setSuccessMsg("Booking permanently deleted and time slot released.");
      setShowDeleteConfirm({ show: false, id: null });
      
    } catch (error: any) {
      console.error("Delete Error details:", error);
      const msg = error?.message || "Failed to delete from database.";
      setActionError(`Delete failed: ${msg}. Check if you have proper admin permissions.`);
    } finally {
      setIsDeleting(null);
    }
  };

  const deleteFAQ = async (id: string) => {
    setIsDeleting(id);
    setActionError(null);
    setSuccessMsg(null);
    
    console.log(`Starting deletion for FAQ ID: ${id}`);
    
    try {
      await deleteDoc(doc(db, "faq_submissions", id));
      console.log("FAQ document deleted successfully");
      
      setFaqs(prev => prev.filter(f => f.id !== id));
      if (selectedItem?.id === id) setSelectedItem(null);
      
      setSuccessMsg("FAQ inquiry permanently deleted.");
      setShowDeleteConfirm({ show: false, id: null });
      
    } catch (error: any) {
      console.error("Delete FAQ Error details:", error);
      const msg = error?.message || "Failed to delete from database.";
      setActionError(`Delete failed: ${msg}. Check if you have proper admin permissions.`);
    } finally {
      setIsDeleting(null);
    }
  };

  const deleteItem = async (id: string) => {
    if (activeTab === 'faqs') {
      await deleteFAQ(id);
    } else {
      await deleteBooking(id);
    }
  };

  const handleSendFAQReply = async (faqItem: FAQSubmission) => {
    if (!replyMsg.trim()) return;
    setIsSubmittingReply(true);
    setActionError(null);
    setSuccessMsg(null);

    try {
      // 1. Send response email via the Send Alert API
      const response = await fetch("/api/send-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "faq_response",
          data: {
            email: faqItem.email,
            question: faqItem.question,
            response: replyMsg
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Could not send response email.");
      }

      // 2. Update Firestore document with response
      await updateDoc(doc(db, "faq_submissions", faqItem.id), {
        status: 'responded',
        answer: replyMsg,
        respondedAt: serverTimestamp()
      });

      // Update local state
      setFaqs(prev => prev.map(f => f.id === faqItem.id ? { ...f, status: 'responded', answer: replyMsg } : f));
      setSelectedItem(prev => prev && prev.id === faqItem.id ? { ...prev, status: 'responded', answer: replyMsg } as any : prev);
      
      setSuccessMsg(`Reply successfully sent to ${faqItem.email}.`);
      setIsReplying(false);
      setReplyMsg("");
    } catch (error: any) {
      console.error("Reply sending failed:", error);
      setActionError(`Failed to send reply email: ${error.message || error}`);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const exportToCSV = () => {
    const data = filteredData;
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).filter(k => k !== 'createdAt');
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        let val = row[header as keyof typeof row];
        if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${activeTab}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
  };

  const filteredData = (
    activeTab === 'bookings' 
      ? bookings 
      : activeTab === 'questionnaires' 
        ? questionnaires 
        : faqs
  ).filter(item => {
    let matchesSearch = false;
    
    if (activeTab === 'faqs') {
      const faqItem = item as FAQSubmission;
      matchesSearch = (faqItem.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (faqItem.question || "").toLowerCase().includes(searchTerm.toLowerCase());
    } else {
      const nonFaqItem = item as Booking | Questionnaire;
      matchesSearch = (nonFaqItem.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nonFaqItem.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (nonFaqItem.phone || "").includes(searchTerm);
    }
    
    if (!matchesSearch) return false;

    if (fromDate || toDate) {
      const itemDate = item.createdAt ? item.createdAt.toDate() : new Date();
      
      if (fromDate) {
        const from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }
      
      if (toDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-grey">
        <Loader2 className="w-10 h-10 text-brand-red animate-spin" />
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-grey p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl text-center"
        >
          <div className="w-20 h-20 bg-brand-red/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-brand-red" />
          </div>
          <h1 className="text-3xl font-serif mb-4">Admin Access</h1>
          <p className="text-gray-500 mb-6 leading-relaxed text-sm">
            {user ? "Your account does not have administrator privileges." : "Please authenticate with your secure clinic credentials."}
          </p>

          {loginError && (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-6 text-sm flex flex-col gap-4 border border-red-100 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-bold">Authentication Error</p>
              </div>
              <p className="text-xs leading-relaxed">{loginError}</p>
            </div>
          )}
          
          {!user ? (
            <div className="space-y-6">
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-red text-white py-3.5 rounded-full font-bold shadow-lg shadow-brand-red/15 hover:bg-brand-red-dark transition-all flex items-center justify-center gap-3 mt-4"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Secure Sign In
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100 text-left">
                <div className="flex gap-2 text-gray-400">
                  <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-brand-red/60" />
                  <div className="text-[10px] leading-relaxed">
                    <p className="font-bold text-gray-500 uppercase tracking-wider mb-0.5 font-sans">Authorized Access Only</p>
                    <p className="text-gray-400">This area is strictly restricted to authorized clinic administrators. Unauthorized login attempts are logged.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl text-left border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Admin ID</p>
                <p className="text-xs font-mono break-all text-gray-700">{user.uid}</p>
                <p className="text-[10px] text-gray-400 mt-2">Logged in as {user.email}</p>
              </div>
              <button 
                onClick={logout}
                className="w-full text-gray-500 font-medium hover:text-brand-red transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-grey pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif text-brand-text mb-2">Clinic Dashboard</h1>
            <p className="text-gray-500">Managing patient submissions and appointment requests.</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={exportToCSV}
              className="bg-white text-gray-700 px-6 py-3 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button 
              onClick={logout}
              className="bg-brand-red/5 text-brand-red px-6 py-3 rounded-full font-medium hover:bg-brand-red/10 transition-all flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stats & Controls */}
        {actionError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center justify-between border border-red-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">{actionError}</p>
            </div>
            <button onClick={() => setActionError(null)} className="text-xs font-bold uppercase tracking-widest hover:underline">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6 flex items-center justify-between border border-green-100 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5" />
              <p className="text-sm font-bold">{successMsg}</p>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-xs font-bold uppercase tracking-widest hover:underline">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 mb-8 items-end">
          <div className="grid grid-cols-3 gap-2 w-full lg:w-[540px] shrink-0">
            <button 
              onClick={() => setActiveTab('bookings')}
              className={cn(
                "px-4 py-4 rounded-3xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm border",
                activeTab === 'bookings' 
                  ? "bg-white border-brand-red text-brand-red ring-4 ring-brand-red/5" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" /> Bookings
              <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-mono">{bookings.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('questionnaires')}
              className={cn(
                "px-4 py-4 rounded-3xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm border",
                activeTab === 'questionnaires' 
                  ? "bg-white border-brand-red text-brand-red ring-4 ring-brand-red/5" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Forms
              <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-mono">{questionnaires.length}</span>
            </button>
            <button 
              onClick={() => setActiveTab('faqs')}
              className={cn(
                "px-4 py-4 rounded-3xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-sm border",
                activeTab === 'faqs' 
                  ? "bg-white border-brand-red text-brand-red ring-4 ring-brand-red/5" 
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" /> FAQ Inquiry
              <span className="ml-auto bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-mono">{faqs.length}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-grow w-full">
            <div className="relative group">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2 block">Patient Search</label>
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 pl-12 outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all shadow-sm text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2 block">From Date</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-white border border-gray-100 rounded-2xl p-3.5 outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all shadow-sm text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-2 block">To Date</label>
                <div className="flex gap-2">
                  <input 
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="flex-grow bg-white border border-gray-100 rounded-2xl p-3.5 outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all shadow-sm text-sm"
                  />
                  {(searchTerm || fromDate || toDate) && (
                    <button 
                      onClick={resetFilters}
                      className="bg-gray-100 text-gray-500 hover:text-brand-red p-3.5 rounded-2xl transition-all shadow-sm flex items-center justify-center shrink-0"
                      title="Clear Filters"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 mb-20">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === 'faqs' ? 'Inquiry / Question' : 'Patient Name'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {activeTab === 'bookings' ? 'Preferred Slot' : activeTab === 'faqs' ? 'Topic / Preview' : 'Form Type'}
                  </th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status / Action</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-grey/30 transition-colors">
                    <td className="px-8 py-6">
                      {activeTab === 'faqs' ? (
                        <div>
                          <p className="font-bold text-gray-900">Custom Inquiry</p>
                          <p className="text-xs text-brand-red mt-1 font-medium font-mono">ID: {item.id.substring(0, 8)}</p>
                        </div>
                      ) : (
                        <>
                          <p className="font-bold text-gray-900">{(item as Booking | Questionnaire).fullName}</p>
                          {activeTab === 'bookings' && (
                            <p className="text-xs text-brand-red mt-1 font-medium">{(item as Booking).service}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-gray-700">{item.email}</p>
                      {activeTab !== 'faqs' && <p className="text-xs text-gray-400 mt-1">{(item as Booking | Questionnaire).phone}</p>}
                    </td>
                    <td className="px-8 py-6">
                      {activeTab === 'bookings' ? (
                        <>
                          <p className="text-sm font-bold text-gray-800">{(item as Booking).preferredDate}</p>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">{(item as Booking).preferredTime}</p>
                        </>
                      ) : activeTab === 'faqs' ? (
                        <div>
                          <p className="text-sm text-gray-800 line-clamp-1 italic max-w-xs">
                            "{(item as FAQSubmission).question}"
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-gray-800">{(item as Questionnaire).formCategory || (item as Questionnaire).formType || 'IV Therapy'}</p>
                          <p className="text-xs text-gray-400">{(item as Questionnaire).date || 'N/A'}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-medium text-gray-600">{formatDate(item.createdAt)}</p>
                    </td>
                    <td className="px-8 py-6">
                      {activeTab === 'bookings' ? (
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            (item as Booking).status === 'pending' ? "bg-yellow-50 text-yellow-600" :
                            (item as Booking).status === 'confirmed' ? "bg-green-50 text-green-600" :
                            "bg-red-50 text-red-600"
                          )}>
                            {(item as Booking).status}
                          </span>
                        </div>
                      ) : activeTab === 'faqs' ? (
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          (item as FAQSubmission).status === 'responded' ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                        )}>
                          {(item as FAQSubmission).status === 'responded' ? 'Replied' : 'Pending'}
                        </span>
                      ) : (
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Medical File
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {activeTab === 'questionnaires' && (
                          <button 
                            onClick={() => downloadQuestionnairePDF(item as any)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all"
                            title="Download PDF"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setIsReplying(false);
                            setReplyMsg("");
                            setSelectedItem(item);
                          }}
                          className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/5 rounded-full transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {activeTab !== 'questionnaires' && (
                          <button 
                            onClick={() => setShowDeleteConfirm({ show: true, id: item.id })}
                            disabled={isDeleting === item.id}
                            className={cn(
                              "p-2 rounded-full transition-all",
                              isDeleting === item.id ? "text-gray-300 animate-pulse" : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            )}
                            title={activeTab === 'faqs' ? "Delete Inquiry" : "Delete Booking"}
                          >
                            {isDeleting === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <Search className="w-12 h-12" />
                        <p className="text-xl font-medium">No results found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-brand-text/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-8 md:p-10 overflow-y-auto">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-3xl font-serif mb-1">
                        {activeTab === 'faqs' ? 'Custom FAQ Inquiry' : (selectedItem as Booking | Questionnaire).fullName}
                      </h2>
                      <p className="text-gray-500 text-sm md:text-base">
                        {selectedItem.email}
                        {activeTab !== 'faqs' && ` • ${(selectedItem as Booking | Questionnaire).phone}`}
                        {activeTab !== 'faqs' && (selectedItem as any).dob && <span className="ml-2 pl-2 border-l border-gray-200">DOB: {(selectedItem as any).dob}</span>}
                      </p>
                      <p className="text-[10px] font-bold text-brand-red uppercase tracking-widest mt-2 block">Submitted: {formatDate(selectedItem.createdAt)}</p>
                    </div>
                    {activeTab === 'bookings' && (
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => initiateAction(selectedItem as Booking, 'confirm')}
                          className="flex items-center gap-2 bg-green-50 text-green-600 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-green-100 transition-all border border-green-100"
                        >
                          <CheckCircle className="w-4 h-4" /> Confirm
                        </button>
                        <button 
                          onClick={() => initiateAction(selectedItem as Booking, 'cancel')}
                          className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-red-100 transition-all border border-red-100"
                        >
                          <XCircle className="w-4 h-4" /> Decline
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm({ show: true, id: selectedItem.id })}
                          disabled={!!isDeleting}
                          className="flex items-center gap-2 bg-gray-50 text-gray-400 px-5 py-2.5 rounded-full text-xs font-bold hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100 disabled:opacity-50"
                        >
                          {isDeleting === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                      </div>
                    )}
                    {activeTab === 'faqs' && (
                      <div className="flex flex-wrap gap-2">
                        {!(selectedItem as FAQSubmission).status || (selectedItem as FAQSubmission).status === 'pending' ? (
                          <button 
                            onClick={() => {
                              setIsReplying(true);
                              setReplyMsg("");
                            }}
                            className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-red-dark transition-all border border-brand-red shadow-sm"
                          >
                            <MessageSquare className="w-4 h-4" /> Reply
                          </button>
                        ) : (
                          <span className="bg-green-50 text-green-600 px-5 py-2.5 rounded-full text-xs font-bold border border-green-100 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Replied
                          </span>
                        )}
                        <button 
                          onClick={() => setShowDeleteConfirm({ show: true, id: selectedItem.id })}
                          disabled={!!isDeleting}
                          className="flex items-center gap-2 bg-gray-50 text-gray-400 px-5 py-2.5 rounded-full text-xs font-bold hover:text-red-600 hover:bg-red-50 transition-all border border-gray-100 disabled:opacity-50"
                        >
                          {isDeleting === selectedItem.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                      </div>
                    )}
                    {activeTab === 'questionnaires' && (
                      <div className="flex flex-wrap gap-2">
                        <button 
                          onClick={() => downloadQuestionnairePDF(selectedItem as any)}
                          className="flex items-center gap-2 bg-brand-red text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-brand-red-dark transition-all border border-brand-red shadow-sm"
                        >
                          <Download className="w-4 h-4" /> Download PDF Form
                        </button>
                      </div>
                    )}
                  </div>
 
                  <div className="space-y-8">
                    {activeTab === 'bookings' ? (
                      <div className="grid grid-cols-2 gap-6 bg-brand-grey/50 p-8 rounded-[2rem]">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Treatment</p>
                          <p className="font-bold">{(selectedItem as Booking).service}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Preferred Slot</p>
                          <p className="font-bold">{(selectedItem as Booking).preferredDate} ({(selectedItem as Booking).preferredTime})</p>
                        </div>
                      </div>
                    ) : activeTab === 'faqs' ? (
                      <div className="space-y-6">
                        <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                          <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2 text-brand-red">
                            <HelpCircle className="w-4 h-4" /> Submitted Question
                          </h4>
                          <p className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap italic">
                            "{(selectedItem as FAQSubmission).question}"
                          </p>
                        </div>

                        {/* Showing existing reply if present */}
                        {(selectedItem as FAQSubmission).status === 'responded' && (
                          <div className="p-6 bg-green-50/50 rounded-[2rem] border border-green-100 space-y-4">
                            <h4 className="font-bold text-sm border-b border-green-200 pb-2 flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" /> Clinical Response
                            </h4>
                            <p className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed">
                              {(selectedItem as FAQSubmission).answer}
                            </p>
                            {((selectedItem as FAQSubmission).respondedAt) && (
                              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block pt-2">
                                Sent On: {formatDate((selectedItem as FAQSubmission).respondedAt)}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Interactive Reply form */}
                        {isReplying && (
                          <div className="p-6 bg-white rounded-[2rem] border border-gray-200 shadow-inner space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <h4 className="font-bold text-sm border-b border-gray-100 pb-2 flex items-center gap-2 text-brand-red">
                              <MessageSquare className="w-4 h-4" /> Draft Clinical Response
                            </h4>
                            <p className="text-xs text-gray-400 leading-relaxed">
                              This response will be emailed directly to the patient's inbox (<strong>{(selectedItem as FAQSubmission).email}</strong>).
                            </p>
                            <textarea
                              rows={5}
                              placeholder="Type your response here..."
                              value={replyMsg}
                              onChange={(e) => setReplyMsg(e.target.value)}
                              className="w-full bg-brand-grey/35 border border-gray-200 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-brand-red/5 focus:border-brand-red transition-all text-sm leading-relaxed"
                            />
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => setIsReplying(false)}
                                disabled={isSubmittingReply}
                                className="flex-grow bg-gray-100 text-gray-500 py-3 rounded-full text-xs font-bold hover:bg-gray-200 transition-all"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendFAQReply(selectedItem as FAQSubmission)}
                                disabled={isSubmittingReply || !replyMsg.trim()}
                                className="flex-[2] bg-brand-red text-white py-3 rounded-full text-xs font-bold hover:bg-brand-red-dark transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-red/10 disabled:opacity-50"
                              >
                                {isSubmittingReply ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <MessageSquare className="w-4 h-4" /> Send Email
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {((selectedItem as Questionnaire).formCategory === 'General Intake' || (selectedItem as Questionnaire).formType === 'General Intake') ? (
                          <>
                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-brand-red" /> Identity & Contact
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400">ID/Passport #:</p>
                                  <p className="font-medium text-gray-900 leading-relaxed break-all">{(selectedItem as Questionnaire).idNumber}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Home Address:</p>
                                  <p className="leading-relaxed">{(selectedItem as Questionnaire).address}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-brand-red" /> Medical Scheme
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400">Scheme Name:</p>
                                  <p className="font-medium">{(selectedItem as Questionnaire).medicalScheme || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Membership #:</p>
                                  <p>{(selectedItem as Questionnaire).membershipNumber || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-brand-red" /> Employment Information
                              </h4>
                              <div className="space-y-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400">Employer Address:</p>
                                  <p className="leading-relaxed">{(selectedItem as Questionnaire).employerAddress || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Employer Contact:</p>
                                  <p className="leading-relaxed">{(selectedItem as Questionnaire).employerContact || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-brand-red" /> Medical Background
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="md:col-span-2">
                                  <p className="text-xs text-gray-400">Emergency Contact:</p>
                                  <p className="font-medium">{(selectedItem as Questionnaire).emergencyContactName} ({(selectedItem as Questionnaire).emergencyContactPhone})</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Conditions:</p>
                                  <p>
                                    {(selectedItem as Questionnaire).medicalConditions === 'Yes' ? (
                                      <>
                                        {(selectedItem as Questionnaire).medicalConditionsSelected?.join(", ")}
                                        {(selectedItem as Questionnaire).medicalConditionsOther && (
                                          <span className="block mt-1 italic text-gray-400 font-normal">
                                            Others: {(selectedItem as Questionnaire).medicalConditionsOther}
                                          </span>
                                        )}
                                      </>
                                    ) : 'None Reported'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Medications:</p>
                                  <p>{(selectedItem as Questionnaire).medications === 'Yes' ? (selectedItem as Questionnaire).medicationsList : 'None Reported'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Allergies:</p>
                                  <p>{(selectedItem as Questionnaire).allergies === 'Yes' ? (selectedItem as Questionnaire).allergiesList : 'None Reported'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Pregnancy:</p>
                                  <p>{(selectedItem as Questionnaire).pregnancy === 'Yes' ? `Yes (Date: ${(selectedItem as Questionnaire).conceptionDate})` : 'No'}</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-brand-red" /> Lifestyle & Goals
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-xs text-gray-400">Smoking:</p>
                                  <p>{(selectedItem as Questionnaire).smoke}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Alcohol:</p>
                                  <p>{(selectedItem as Questionnaire).alcohol}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Daily Water:</p>
                                  <p>{(selectedItem as Questionnaire).waterIntake}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400">Previous IV:</p>
                                  <p>{(selectedItem as Questionnaire).previousIv}</p>
                                </div>
                              </div>
                            </div>

                            <div className="p-6 bg-brand-grey/50 rounded-[2rem] space-y-4">
                              <h4 className="font-bold text-sm border-b border-gray-200 pb-2">Treatment Reason</h4>
                              <p className="text-sm">{(selectedItem as Questionnaire).primaryReason}</p>
                              <p className="text-xs text-gray-400">Desired Outcome: <span className="text-gray-700 italic">{(selectedItem as Questionnaire).desiredOutcome}</span></p>
                            </div>
                          </>
                        )}

                        <div className="flex items-center gap-4 p-6 border border-gray-100 rounded-3xl mt-6">
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Digital Signature</p>
                            <div className="bg-brand-grey/50 rounded-xl p-4 border border-gray-100">
                              <img 
                                src={(selectedItem as Questionnaire).signature} 
                                alt="Signature" 
                                className="max-h-24 mix-blend-multiply h-auto mx-auto"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Consent Given</p>
                            <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Confirmed</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-8 border-t border-gray-50 flex items-center justify-center gap-4">
                  {activeTab === 'questionnaires' && (
                    <button 
                      onClick={() => downloadQuestionnairePDF(selectedItem as any)}
                      className="bg-brand-red text-white py-3.5 px-8 rounded-full font-bold shadow-lg shadow-brand-red/15 hover:bg-brand-red-dark transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Patient File (PDF)
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-500 font-bold px-12 py-3.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Communication Modal */}
        <AnimatePresence>
          {commModal.show && commModal.booking && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCommModal({ ...commModal, show: false })}
                className="absolute inset-0 bg-brand-text/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      commModal.type === 'confirm' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                    )}>
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold">
                      {commModal.type === 'confirm' ? 'Confirm Booking' : 'Decline Booking'}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    This message will be queued for delivery via <strong>Email</strong> and <strong>SMS</strong> to <span className="font-bold text-gray-800">{commModal.booking.fullName}</span>.
                  </p>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message Content</label>
                    <textarea 
                      value={customMsg}
                      onChange={(e) => setCustomMsg(e.target.value)}
                      rows={5}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-red outline-none resize-none transition-all"
                    />
                  </div>

                  <div className="mt-8 flex flex-col md:flex-row gap-3">
                    <button 
                      onClick={() => setCommModal({ ...commModal, show: false })}
                      className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all font-sans"
                    >
                      Close
                    </button>
                    
                    <button 
                      onClick={() => handleSendCommunication('whatsapp')}
                      disabled={isSending}
                      className={cn(
                        "flex-[2] text-white py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2",
                        commModal.type === 'confirm' ? "bg-green-600 hover:bg-green-700" :
                        "bg-red-600 hover:bg-red-700",
                        isSending ? "opacity-70" : ""
                      )}
                    >
                      {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          <MessageSquare className="w-5 h-5" /> Send via WhatsApp
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm.show && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isDeleting && setShowDeleteConfirm({ show: false, id: null })}
                className="absolute inset-0 bg-brand-text/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden p-8 text-center"
              >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif mb-4">Delete Booking?</h3>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  This action is permanent. It will delete the patient record and immediately release the reserved time slot for other patients.
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowDeleteConfirm({ show: false, id: null })}
                    disabled={!!isDeleting}
                    className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => showDeleteConfirm.id && deleteBooking(showDeleteConfirm.id)}
                    disabled={!!isDeleting}
                    className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Now"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
