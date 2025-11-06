import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Mail, Lock, User, Building } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { authApi } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        // Sign in
        await authApi.signIn({ email, password });
        toast.success('Welcome back!');
        onLogin(email, password);
      } else {
        // Sign up
        const names = name.split(' ');
        const firstName = names[0] || 'User';
        const lastName = names.slice(1).join(' ') || 'User';

        await authApi.signUp({
          email,
          password,
          firstName,
          lastName,
          role: 'EMPLOYEE', // Default to employee, can be changed by admin
        });

        toast.success('Account created successfully! Please sign in.');
        setActiveTab('login');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    // Reset form when switching tabs
    setEmail('');
    setPassword('');
    setName('');
    setCompany('');
  };

  return (
    <div className="bg-background relative size-full min-h-screen flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-card border border-border rounded-3xl w-full max-w-md shadow-lg overflow-hidden"
      >
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-16 h-16 bg-foreground rounded-2xl flex items-center justify-center mb-4"
            >
              <Users className="w-8 h-8 text-background" />
            </motion.div>
            <h1 className="text-foreground text-center mb-1">TeamifyHR</h1>
            <p className="text-muted-foreground text-center">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </p>
          </motion.div>
        </div>

        {/* Tab Buttons */}
        <div className="px-8 pb-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-1 bg-accent p-1 rounded-xl"
          >
            <motion.button
              type="button"
              onClick={() => handleTabChange('login')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 px-6 py-2.5 rounded-lg transition-all text-center ${
                activeTab === 'login' 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Login
            </motion.button>
            <motion.button
              type="button"
              onClick={() => handleTabChange('signup')}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex-1 px-6 py-2.5 rounded-lg transition-all text-center ${
                activeTab === 'signup' 
                  ? 'bg-foreground text-background shadow-sm' 
                  : 'bg-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign up
            </motion.button>
          </motion.div>
        </div>

        {/* Form Section */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@teamify.com"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Forgot Password Link */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Full Name Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Company Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Company Name
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Corporation"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@teamify.com"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Password
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-input-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  {/* Terms and Conditions */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 rounded border-border"
                      required
                    />
                    <label htmlFor="terms" className="text-muted-foreground">
                      I agree to the{' '}
                      <button type="button" className="text-foreground hover:underline">
                        Terms and Conditions
                      </button>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-foreground text-background py-3.5 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 mt-6 shadow-sm text-center"
            >
              <motion.span
                animate={isLoading ? { opacity: [1, 0.5, 1] } : {}}
                transition={isLoading ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {isLoading 
                  ? 'Loading...' 
                  : activeTab === 'login' 
                    ? 'Sign In' 
                    : 'Create Account'
                }
              </motion.span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
