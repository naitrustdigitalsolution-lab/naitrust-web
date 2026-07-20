import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Check, Upload, Shield, Building, User as UserIcon, Phone, Mail, Instagram, MessageCircle, Image as ImageIcon, X, Plus, Facebook, Twitter, Globe, Linkedin, HelpCircle, Sparkles, AlertTriangle, ExternalLink, FileText, ShieldCheck, Scale } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, PasswordInput } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { toast } from 'sonner';
import { NaitrustLogo } from '../utility/NaitrustLogo';
import { CATEGORIES } from '../../libs/constant';
import { NIGERIAN_STATES } from '../../libs/constant';
import { authApi, businessApi } from '../../libs/api';
import { useAuth } from '../../libs/auth-context';
import { useBusinessStore } from '../../libs/store/business.store';
import { PhoneField } from '../pieces/general/PhoneField';
import { RegistrationStepper } from '../pieces/registration/RegistrationStepper';
import { BeforeYouStartCard } from '../pieces/registration/BeforeYouStartCard';
import { openWaitlistModal } from '../modals/WaitlistModal';
import type { SocialHandleInterface } from '../../interfaces/SocialHandleInterface';
import type { TeamMemberInterface } from '../../interfaces/TeamMemberInterface';
import { useLocation } from 'react-router-dom';
import icon from '../../assets/naitrust-logo/naitrust-icon-3.png';
import spiralBackground from '../../assets/spiral.svg';
import { useTheme } from '@/hooks/useTheme';

interface RegistrationPageProps {
  onNavigate: (page: string, params?: any) => void;
  registrationType: 'business' | 'customer';
}

const smoothViewFade = { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const };

// Registration is not open yet — the form still renders so people can see
// what's needed, but the Continue/Complete button opens the waitlist modal
// instead of advancing or submitting. Flip to true once launch is ready.
const REGISTRATION_OPEN = false;

export function RegistrationPage({ onNavigate, registrationType }: RegistrationPageProps) {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { myBusinesses, currentBusiness } = useBusinessStore();
  const { fetchMyBusinesses, setCurrentBusiness } = useBusinessStore();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    socialHandles: [] as SocialHandleInterface[],
    teamMembers: [] as TeamMemberInterface[],
    verificationType: 'unverified', // Default to unverified
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');

  // Auto-populate owner information for logged-in users
  useEffect(() => {
    if (isAuthenticated && user && registrationType === 'business') {
      setFormData((prev: any) => ({
        ...prev,
        ownerFirstName: user.firstName || '',
        ownerLastName: user.lastName || '',
        ownerEmail: user.email || '',
        ownerPhone: user.phone || '',
      }));
    }
  }, [isAuthenticated, user, registrationType]);

  const totalSteps = registrationType === 'business' ? 4 : 2; // 4 steps for business (Personal, Business Info, Business Details, Review)

  const validateBusinessStep = (step: number): string | null => {
    switch (step) {
      case 1: {
        if (!isAuthenticated) {
          if (!formData.ownerFirstName?.trim()) return 'Owner first name is required';
          if (!formData.ownerLastName?.trim()) return 'Owner last name is required';
          if (!formData.ownerEmail?.trim()) return 'Owner email is required';
          if (!formData.ownerPhone?.trim()) return 'Owner phone number is required';
          if (!formData.password?.trim()) return 'Password is required';
          if (formData.password.length < 8) return 'Password must be at least 8 characters';
        }
        return null;
      }
      case 2: {
        if (!formData.businessName?.trim()) return 'Business name is required';
        if (!formData.category) return 'Business category is required';
        if (!formData.description?.trim()) return 'Business description is required';
        if (!formData.businessEmail?.trim()) return 'Business email is required';
        return null;
      }
      case 3: {
        if (!formData.address?.trim()) return 'Business address is required';
        if (!formData.city?.trim()) return 'City is required';
        if (!formData.state) return 'State is required';
        return null;
      }
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (registrationType === 'customer' && currentStep === 2) {
      await handleCustomerRegistration();
    } else if (currentStep < totalSteps) {
      if (registrationType === 'business') {
        const error = validateBusinessStep(currentStep);
        if (error) {
          toast.error(error);
          return;
        }
      }
      setCurrentStep(currentStep + 1);
    } else {
      await handleBusinessRegistration();
    }
  };

  const handleCustomerRegistration = async () => {
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Call registration API
      const response = await authApi.register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'customer',
      });

      if (response.success) {
        toast.success(response.data?.message || 'Registration successful! Please check your email to verify your account.');
        // Redirect to verify email page
        setTimeout(() => {
          onNavigate('verify-email', { email: formData.email });
        }, 1500);
      } else {
        toast.error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already registered') || error.message?.includes('Email already registered')) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-medium">Email Already Registered</p>
            <p className="text-sm">This email is already registered. Please login or use a different email.</p>
            <button 
              onClick={() => onNavigate('login')} 
              className="text-sm text-left underline hover:no-underline"
            >
              Go to Login
            </button>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBusinessRegistration = async () => {
    try {
      setIsSubmitting(true);

      // Check if user is already logged in
      if (isAuthenticated && user) {
        // User is logged in - create business for existing user
        if (!formData.businessName || !formData.category) {
          toast.error('Please fill in all required fields');
          return;
        }

        const businessData = {
          name: formData.businessName,
          description: formData.description || '',
          category: formData.category,
          email: formData.email || formData.businessEmail || user.email || '',
          phoneNumber: formData.phone || formData.businessPhone || '',
          website: formData.website || '',
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          country: formData.country || 'Nigeria',
          socialHandles: formData.socialHandles || [],
        };

        const response = await businessApi.create(businessData);

        if (response.success && response.data) {
          toast.success('Business created successfully!');
          
          // Refresh businesses list and set the new business as current
          await fetchMyBusinesses();
          setCurrentBusiness(response.data);
          
          setTimeout(() => {
            onNavigate('business-dashboard');
          }, 1500);
        } else {
          toast.error(response.message || 'Failed to create business');
        }
      } else {
        // User is not logged in - register new user
        if (!formData.ownerEmail || !formData.password || !formData.businessName) {
          toast.error('Please fill in all required fields');
          return;
        }

        // Register user with business data included in the payload
        const response = await authApi.register({
          email: formData.ownerEmail,
          password: formData.password,
          firstName: formData.ownerFirstName,
          lastName: formData.ownerLastName,
          role: 'business',
          pendingBusinessData: {
            name: formData.businessName,
            description: formData.description || '',
            category: formData.category || '',
            email: formData.businessEmail || formData.ownerEmail || '',
            phoneNumber: formData.businessPhone || formData.ownerPhone || '',
            website: formData.website || '',
            address: formData.address || '',
            city: formData.city || '',
            state: formData.state || '',
            country: formData.country || 'Nigeria',
            socialHandles: formData.socialHandles || [],
            verificationType: formData.verificationType || 'unverified',
            registrationNumber: formData.registrationNumber || '',
          },
        });

        if (response.success) {
          toast.success('Registration successful! Please check your email to verify your account.');
          setTimeout(() => onNavigate('verify-email', { email: formData.ownerEmail }), 1500);
        } else {
          toast.error(response.message || 'Registration failed');
        }
      }
    } catch (error: any) {
      console.error('Business registration error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('already registered') || error.message?.includes('Email already registered')) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p className="font-medium">Email Already Registered</p>
            <p className="text-sm">This email is already registered. Please login or use a different email.</p>
            <button 
              onClick={() => onNavigate('login')} 
              className="text-sm text-left underline hover:no-underline"
            >
              Go to Login
            </button>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(error.message || 'Failed to register. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      // Check if there's a previous route in location state
      const fromRoute = (location.state as any)?.from;
      if (fromRoute) {
        // Navigate back to previous route
        window.history.back();
      } else if (isAuthenticated) {
        onNavigate('business-dashboard');
      } else {
        // onNavigate('login');
         window.history.back();
      }
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.businessName || !formData.category) {
      toast.error('Please provide business name and category first');
      return;
    }
    
    setIsGeneratingDescription(true);
    try {
      // TODO: Implement AI description generation API
      // For now, generate a simple placeholder
      const generatedDescription = `Welcome to ${formData.businessName}! We are a ${formData.category} business dedicated to providing quality products and services. Our team is committed to excellence and customer satisfaction.`;
      
      updateFormData('description', generatedDescription);
      toast.success('Business description generated! You can edit it to fit your needs.');
    } catch (error: any) {
      toast.error('Failed to generate description. Please write it manually.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const updateFormData = (key: string, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const addSocialHandle = () => {
    updateFormData('socialHandles', [...(formData.socialHandles || []), { platform: '', value: '' }]);
  };

  const removeSocialHandle = (index: number) => {
    const handles = [...formData.socialHandles];
    handles.splice(index, 1);
    updateFormData('socialHandles', handles);
  };

  const updateSocialHandle = (index: number, field: 'platform' | 'value', value: string) => {
    const handles = [...formData.socialHandles];
    handles[index][field] = value;
    updateFormData('socialHandles', handles);
  };

  // Customer Registration Steps (Simplified - 2 steps only)
  const renderCustomerStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="customer-step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={32} className="text-primary" />
              </div>
              <h2>Personal Information</h2>
              <p className="text-muted-foreground">Let's start with your basic details</p>
            </div>

            {/* Google Sign-up Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              onClick={() => {
                toast.info('Google Sign-In will be available soon! For now, please use email and password to register.');
              }}
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    value={formData.firstName || ''}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName || ''}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email || ''}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <PhoneField
                  id="phone"
                  className="mt-1.5"
                  value={formData.phone || ''}
                  onChange={(v) => updateFormData('phone', v)}
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <PasswordInput
                  id="password"
                  placeholder="Create a strong password"
                  value={formData.password || ''}
                  onChange={(e) => updateFormData('password', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword || ''}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="customer-step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-primary" />
              </div>
              <h2>Terms & Conditions</h2>
              <p className="text-muted-foreground">
                Review and accept our{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">terms</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy policy</a>
              </p>
            </div>

            <div className="bg-accent border border-primary/20 rounded-lg p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Check className="text-primary mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-medium">Complete Your Profile Later</h4>
                  <p className="text-sm text-muted-foreground">
                    You can add additional details in your profile after registration for enhanced features.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="text-primary mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-medium">Secure & Private</h4>
                  <p className="text-sm text-muted-foreground">
                    Your information is encrypted and protected. We comply with NDPR regulations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Check className="text-primary mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-medium">Verify Businesses</h4>
                  <p className="text-sm text-muted-foreground">
                    Create documented property transactions with sellers, agents, developers, and property companies.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1"
                  checked={formData.acceptTerms || false}
                  onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  I agree to Naitrust's{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="marketing"
                  className="mt-1"
                  checked={formData.acceptMarketing || false}
                  onChange={(e) => updateFormData('acceptMarketing', e.target.checked)}
                />
                <Label htmlFor="marketing" className="text-sm cursor-pointer">
                  I want to receive updates and promotional offers from Naitrust (optional)
                </Label>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Business Registration Steps - 5 steps: Personal Info, Business Info, Business Details, Verification, Review
  const renderBusinessStep = () => {
    switch (currentStep) {
      // Step 1: Personal Information (Owner details + Business email/phone/website)
      case 1:
        return (
          <motion.div
            key="business-step1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon size={32} className="text-primary" />
              </div>
              <h2>Personal Information</h2>
              <p className="text-muted-foreground">Tell us about the authorised property business representative</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerFirstName">Owner First Name *</Label>
                  <Input
                    id="ownerFirstName"
                    placeholder="First name"
                    value={formData.ownerFirstName || ''}
                    onChange={(e) => updateFormData('ownerFirstName', e.target.value)}
                    disabled={isAuthenticated && user !== null}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerLastName">Owner Last Name *</Label>
                  <Input
                    id="ownerLastName"
                    placeholder="Last name"
                    value={formData.ownerLastName || ''}
                    onChange={(e) => updateFormData('ownerLastName', e.target.value)}
                    disabled={isAuthenticated && user !== null}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ownerEmail">Owner Email (Personal Email) *</Label>
                <Input
                  id="ownerEmail"
                  type="email"
                  placeholder="your.personal@email.com"
                  value={formData.ownerEmail || ''}
                  onChange={(e) => updateFormData('ownerEmail', e.target.value)}
                  disabled={isAuthenticated && user !== null}
                />
              </div>

              <div>
                <Label htmlFor="ownerPhone">Owner Phone *</Label>
                <PhoneField
                  id="ownerPhone"
                  className="mt-1.5"
                  value={formData.ownerPhone || ''}
                  onChange={(v) => updateFormData('ownerPhone', v)}
                  disabled={isAuthenticated && user !== null}
                  required
                />
              </div>

              {!isAuthenticated && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Create a strong password"
                    value={formData.password || ''}
                    onChange={(e) => updateFormData('password', e.target.value)}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );

      // Step 2: Business Information (Business name, category, description)
      case 2:
        return (
          <motion.div
            key="business-step2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building size={32} className="text-primary" />
              </div>
              <h2>Business Information</h2>
              <p className="text-muted-foreground">Tell us about your real estate, development, agency, or professional business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Enter your registered business name"
                  value={formData.businessName || ''}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="category">Business Category *</Label>
                <Select onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger className="rounded-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="sticky top-0 z-10 bg-popover p-2" onKeyDown={(event) => event.stopPropagation()}>
                      <Input
                        value={categorySearch}
                        onChange={(event) => setCategorySearch(event.target.value)}
                        placeholder="Search business categories"
                        className="h-10"
                        onPointerDown={(event) => event.stopPropagation()}
                      />
                    </div>
                    {CATEGORIES.filter((cat) => cat.toLowerCase().includes(categorySearch.toLowerCase())).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="description">Business Description *</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle size={16} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Describe what your business does, your products or services, and what makes you unique.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription || !formData.businessName || !formData.category}
                    className="ml-auto"
                  >
                    <Sparkles size={14} className="mr-2" />
                    {isGeneratingDescription ? 'Generating...' : 'AI Generate'}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  placeholder="Briefly describe what your business does..."
                  className="min-h-[100px]"
                  value={formData.description || ''}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-medium mb-4">Business Contact Information</h3>
                
                <div>
                  <Label htmlFor="businessEmail">Business Email *</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    placeholder="contact@business.com"
                    value={formData.businessEmail || ''}
                    onChange={(e) => updateFormData('businessEmail', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Please use the email associated with your CAC business registration
                  </p>
                </div>

                <div className="mt-4">
                  <Label htmlFor="businessPhone">Business Phone Number (Optional)</Label>
                  <PhoneField
                    id="businessPhone"
                    className="mt-1.5"
                    value={formData.businessPhone || ''}
                    onChange={(v) => updateFormData('businessPhone', v)}
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="website">Business Website (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://www.example.com"
                    value={formData.website || ''}
                    onChange={(e) => updateFormData('website', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      // Step 3: Business Details (Address, State, Country, Social Handles)
      case 3:
        return (
          <motion.div
            key="business-step3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building size={32} className="text-primary" />
              </div>
              <h2>Business Details</h2>
              <p className="text-muted-foreground">Location and contact information</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Business Address *</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address || ''}
                  onChange={(e) => updateFormData('address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city || ''}
                    onChange={(e) => updateFormData('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select onValueChange={(value) => updateFormData('state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value="Nigeria"
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <Label>Social Media Handles (Optional)</Label>
                <div className="space-y-3 mt-2">
                  {formData.socialHandles?.map((handle: SocialHandleInterface, index: number) => (
                    <div key={index} className="flex gap-2">
                      <Select
                        value={handle.platform}
                        onValueChange={(value) => updateSocialHandle(index, 'platform', value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue placeholder="Platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="threads">Threads</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="@username or link"
                        value={handle.value}
                        onChange={(e) => updateSocialHandle(index, 'value', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSocialHandle(index)}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialHandle}
                  >
                    <Plus size={16} className="mr-2" />
                    Add Social Handle
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );

      // Step 4: Review & Submit
      case 4:
        return (
          <motion.div
            key="business-step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothViewFade}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-primary" />
              </div>
              <h2>Review & Submit</h2>
              <p className="text-muted-foreground">Confirm your information</p>
            </div>

            <div className="space-y-3">
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { href: '/terms', icon: FileText, label: 'Terms of Service' },
                  { href: '/privacy', icon: Shield, label: 'Privacy Policy' },
                  { href: '/verification-policy', icon: ShieldCheck, label: 'Verification Policy' },
                  { href: '/compliance', icon: Scale, label: 'Compliance Policy' },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      `
                        flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background text-sm 
                        text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors group
                        ${formData.acceptTerms ? 'border-primary/40 text-primary' : ''}
                      `
                    }
                  >
                    <Icon size={15} className={
                      `shrink-0 text-muted-foreground/60 group-hover:text-primary transition-colors
                      ${formData.acceptTerms ? 'text-primary' : ''}
                      `
                    } />
                    <span className="flex-1 truncate">{label}</span>
                    <ExternalLink size={13} className={`
                      shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                      ${formData.acceptTerms ? 'opacity-100 text-primary' : ''}
                      `} />
                  </a>
                ))}
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-0.5"
                  checked={formData.acceptTerms || false}
                  onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I have read and agree to the following policies:
                </Label>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const customerSteps = [
    { title: 'Personal Information', description: 'Create your buyer account.' },
    { title: 'Terms & Conditions', description: 'Review privacy and account terms.' },
  ];
  const businessSteps = [
    { title: 'Owner Information', description: 'Tell us who owns the account.' },
    { title: 'Business Information', description: 'Add your business profile basics.' },
    { title: 'Business Details', description: 'Add location and contact channels.' },
    { title: 'Review & Submit', description: 'Confirm policies and submit.' },
  ];
  const steps = registrationType === 'business' ? businessSteps : customerSteps;
  const currentStepMeta = steps[currentStep - 1];

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-foreground dark:bg-background">
      <div className="absolute inset-y-0 left-0 hidden w-[55%] bg-[#eef3f8] dark:bg-[#0A0E1A] lg:block" />
       <div className="pointer-events-none absolute inset-0 mx-auto max-w-520 px-4 sm:px-6 lg:px-8 ">
          <img
            src={spiralBackground}
            alt=""
            aria-hidden="true"
            className="absolute left-4 top-1/2 bottom-0 h-[1000px] w-[1000px] max-w-none -translate-y-1/2 rotate-180 opacity-100 sm:left-6 lg:left-8"
          />
        </div>
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-7xl xl:gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <aside className="flex flex-col justify-between rounded-2xl bg-none lg:bg-[#eef3f8] p-5 dark:bg-[#0A0E1A] sm:p-8 lg:rounded-none lg:p-10">
          <div>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="mb-6 hidden lg:inline-flex items-center lg:mb-12"
              aria-label="Go to Naitrust home"
            >
              <NaitrustLogo size="postMd" showText={true} textColor={isDarkMode ? "text-white" : "text-primary"} />
            </button>

            <div className="max-w-md hidden lg:block">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
                Setup a profile
              </p>
              <h1 className="text-xl font-bold leading-tight text-[#0b2b45] dark:text-white sm:text-3xl lg:text-4xl xl:text-5xl">
                {registrationType === 'business' ? 'Create your property business trust profile.' : 'Create your property buyer or seller account.'}
              </h1>
              <p className="mt-2 text-sm leading-6 text-[#496274] dark:text-slate-300 sm:mt-4 sm:text-base lg:text-md xl:text-lg sm:leading-7">
                Follow the steps below to get started with Naitrust. Your information helps keep buyers, sellers, and transaction records easier to trust.
              </p>
            </div>

            <div className="mt-6 max-w-md lg:mt-10">
              <RegistrationStepper steps={steps} currentStep={currentStep} />
            </div>
          </div>

          {/* Desktop: requirements + login link live in the side panel. On mobile
              the requirements card is moved BELOW the form (split copy). */}
          <div className="mt-10 hidden gap-5 lg:grid">
            <BeforeYouStartCard registrationType={registrationType} />
            <div className="text-sm leading-6 text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-h-full flex-col items-center justify-center py-4 lg:py-10">
          <div className="w-full max-w-xl sm:rounded-2xl sm:border sm:border-border/70 bg-card p-5 sm:shadow-2xl sm:p-8">
            <button
              type="button"
              onClick={handleBack}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:underline"
            >
              <ArrowLeft size={16} />
              {currentStep === 1 ? (isAuthenticated ? 'Back to dashboard' : 'Go back') : 'Go back'}
            </button>

            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center p-2">
                <NaitrustLogo size="postMd" showText={false} />
              </div>
              <p className="mb-2 text-sm font-semibold text-primary">
                Step {currentStep} of {totalSteps}
              </p>
              <h2 className="text-2xl font-bold">
                {currentStepMeta?.title || (registrationType === 'business' ? 'Business Registration' : 'Create Your Account')}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {registrationType === 'business'
                  ? 'For real estate companies, agents, developers, and transaction professionals.'
                  : 'For individuals buying or selling property in Nigeria.'}
              </p>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {registrationType === 'customer' ? renderCustomerStep() : renderBusinessStep()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-12 flex-1 rounded-full"
              >
                <ArrowLeft size={16} className="mr-2" />
                {currentStep === 1 ? (isAuthenticated ? 'Back to Dashboard' : 'Back') : 'Back'}
              </Button>
              <Button
                onClick={() => {
                  if (!REGISTRATION_OPEN) {
                    openWaitlistModal();
                    return;
                  }
                  handleNext();
                }}
                className="h-12 flex-1 rounded-full"
                disabled={isSubmitting || (currentStep === totalSteps && !formData.acceptTerms)}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : currentStep === totalSteps ? (
                  <>
                    Complete Registration
                    <Check size={16} className="ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile: the requirements card sits BELOW the form (split copy). */}
          <div className="mt-6 grid w-full max-w-xl gap-5 lg:hidden">
            <BeforeYouStartCard registrationType={registrationType} />
            <div className="text-center text-sm leading-6 text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="font-semibold text-primary hover:underline"
              >
                Login
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
