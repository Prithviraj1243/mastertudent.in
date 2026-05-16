import { useState } from 'react';
import { 
  CheckCircle, 
  Sparkles, 
  Crown, 
  Upload, 
  AlertCircle,
  Zap,
  Star,
  Trophy,
  Flame
} from 'lucide-react';

interface VerifyTopperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function VerifyTopperModal({ isOpen, onClose, onSuccess }: VerifyTopperModalProps) {
  const [step, setStep] = useState<'initial' | 'uploading' | 'verifying' | 'success'>('initial');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    examResults: null as File | null,
    subject: '',
    score: '',
    examName: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, examResults: 'File size must be less than 10MB' });
        return;
      }
      setFormData({ ...formData, examResults: file });
      setErrors({ ...errors, examResults: '' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.examResults) newErrors.examResults = 'Please upload exam results';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.score.trim()) newErrors.score = 'Score is required';
    if (!formData.examName.trim()) newErrors.examName = 'Exam name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setStep('uploading');
    
    // Simulate file upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setStep('verifying');
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Submit to backend
    try {
      const formDataToSend = new FormData();
      if (formData.examResults) {
        formDataToSend.append('examResults', formData.examResults);
      }
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('score', formData.score);
      formDataToSend.append('examName', formData.examName);

      const response = await fetch('/api/verify-topper', {
        method: 'POST',
        body: formDataToSend,
        credentials: 'include'
      });

      if (response.ok) {
        setStep('success');
        setTimeout(() => {
          onSuccess?.();
          window.location.reload();
        }, 3000);
      } else {
        setStep('initial');
        setErrors({ submit: 'Verification failed. Please try again.' });
      }
    } catch (error) {
      setStep('initial');
      setErrors({ submit: 'Error submitting verification. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in p-4">
      {/* Main Modal Container */}
      <div className="relative w-full max-w-2xl">
        {/* Animated Background Orbs */}
        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl animate-pulse"></div>
        <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-3xl blur-xl"></div>

        {/* Modal Content */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900/50 to-slate-900 rounded-3xl p-8 border border-cyan-500/30 shadow-2xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_25%,rgba(68,68,68,.2)_50%,transparent_50%,transparent_75%,rgba(68,68,68,.2)_75%,rgba(68,68,68,.2))] bg-[length:60px_60px] animate-pulse"></div>
          </div>

          <div className="relative z-10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* INITIAL STEP */}
            {step === 'initial' && (
              <div className="animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-cyan-500/50">
                        <Crown className="h-10 w-10 text-white" />
                      </div>
                      <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                      <Flame className="h-8 w-8 absolute -bottom-2 -left-2 text-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                    Become a Topper! 🌟
                  </h2>
                  <p className="text-cyan-300 text-lg mb-2">Join the elite community of knowledge creators</p>
                  <p className="text-gray-400 text-sm">Upload your competitive exam results to get verified and unlock VIP features</p>
                </div>

                {/* Benefits Section */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <Trophy className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-white text-sm">VIP Badge</p>
                        <p className="text-xs text-gray-400">Stand out with exclusive badge</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4 hover:border-purple-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <Zap className="h-5 w-5 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-white text-sm">Boost Earnings</p>
                        <p className="text-xs text-gray-400">Get 2x coin rewards</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4 hover:border-green-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <Star className="h-5 w-5 text-green-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-white text-sm">Priority Upload</p>
                        <p className="text-xs text-gray-400">Faster verification</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 hover:border-orange-400/50 transition-all">
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-orange-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-white text-sm">Featured Notes</p>
                        <p className="text-xs text-gray-400">Get featured placement</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* File Input */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      📄 Upload Exam Results (PDF/Image)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        name="examResults"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="w-full px-4 py-3 bg-slate-800/50 border-2 border-dashed border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/30 file:text-cyan-300 hover:file:bg-cyan-600/50 cursor-pointer"
                      />
                      {formData.examResults && (
                        <div className="absolute right-3 top-3 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    {errors.examResults && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.examResults}
                      </p>
                    )}
                    {formData.examResults && (
                      <p className="text-green-400 text-xs mt-2">✓ {formData.examResults.name}</p>
                    )}
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      📚 Subject/Stream
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="e.g., Mathematics, Physics, Medical"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-300"
                    />
                    {errors.subject && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Score Input */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      🎯 Score/Percentage
                    </label>
                    <input
                      type="text"
                      name="score"
                      value={formData.score}
                      onChange={handleInputChange}
                      placeholder="e.g., 95%, 450/500, 99.5 percentile"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-300"
                    />
                    {errors.score && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.score}
                      </p>
                    )}
                  </div>

                  {/* Exam Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      📋 Exam Name
                    </label>
                    <input
                      type="text"
                      name="examName"
                      value={formData.examName}
                      onChange={handleInputChange}
                      placeholder="e.g., JEE Main, NEET, CBSE Board, GATE"
                      className="w-full px-4 py-3 bg-slate-800/50 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition-all duration-300"
                    />
                    {errors.examName && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> {errors.examName}
                      </p>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-red-400 text-sm">{errors.submit}</p>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-all duration-300 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Verify Now
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* UPLOADING STEP */}
            {step === 'uploading' && (
              <div className="animate-fade-in text-center py-12">
                <div className="flex justify-center mb-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                      <Upload className="h-10 w-10 text-cyan-400 animate-pulse" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Uploading Your Results</h3>
                <p className="text-gray-400 mb-6">Please wait while we process your exam results...</p>
                
                {/* Progress Bar */}
                <div className="max-w-xs mx-auto mb-4">
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden border border-cyan-500/30">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-cyan-400 text-sm font-semibold mt-2">{uploadProgress}%</p>
                </div>

                {/* Animated dots */}
                <div className="flex justify-center gap-2 mt-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            )}

            {/* VERIFYING STEP */}
            {step === 'verifying' && (
              <div className="animate-fade-in text-center py-12">
                <div className="flex justify-center mb-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-purple-400 animate-spin" />
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Verifying Your Credentials</h3>
                <p className="text-gray-400 mb-6">Our team is reviewing your exam results...</p>
                
                {/* Verification checklist */}
                <div className="max-w-xs mx-auto space-y-3 text-left">
                  {[
                    { label: 'Checking document authenticity', delay: 0 },
                    { label: 'Verifying exam details', delay: 0.3 },
                    { label: 'Processing credentials', delay: 0.6 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${item.delay}s` }}>
                      <div className="w-5 h-5 rounded-full border-2 border-purple-400 flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      </div>
                      <span className="text-gray-300 text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUCCESS STEP */}
            {step === 'success' && (
              <div className="animate-fade-in text-center py-12">
                {/* Celebration Animation */}
                <div className="flex justify-center mb-8">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full animate-pulse shadow-lg shadow-yellow-500/50"></div>
                    <div className="absolute inset-2 bg-slate-900 rounded-full flex items-center justify-center">
                      <Trophy className="h-10 w-10 text-yellow-400 animate-bounce" />
                    </div>
                    {/* Confetti-like sparkles */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                        style={{
                          top: `${Math.random() * 100}%`,
                          left: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.1}s`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>

                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-gray-300 mb-8">You've been verified as a Topper!</p>

                {/* Success Details */}
                <div className="max-w-md mx-auto space-y-4 mb-8">
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4">
                    <p className="text-cyan-300 font-semibold mb-1">💎 VIP Badge Unlocked</p>
                    <p className="text-sm text-gray-400">Your profile now shows the exclusive VIP badge</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                    <p className="text-purple-300 font-semibold mb-1">⚡ 2x Coin Rewards</p>
                    <p className="text-sm text-gray-400">Earn double coins on all note downloads</p>
                  </div>
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                    <p className="text-green-300 font-semibold mb-1">🚀 Priority Features</p>
                    <p className="text-sm text-gray-400">Access exclusive topper tools and analytics</p>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50"
                >
                  Start Earning as a Topper! 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
