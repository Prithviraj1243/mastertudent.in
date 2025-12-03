import { useState } from 'react';
import { CheckCircle, Sparkles, Crown, Upload, AlertCircle, Zap, Star, Trophy, Flame, ArrowRight, Target, TrendingUp, Award, Coins, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BecomeTopper() {
  const [step, setStep] = useState<'intro' | 'form' | 'uploading' | 'verifying' | 'success'>('intro');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ examResults: null as File | null, subject: '', score: '', examName: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(i);
    }

    setStep('verifying');
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const formDataToSend = new FormData();
      if (formData.examResults) formDataToSend.append('examResults', formData.examResults);
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
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setStep('form');
        setErrors({ submit: 'Verification failed. Please try again.' });
      }
    } catch (error) {
      setStep('form');
      setErrors({ submit: 'Error submitting verification. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          {[...Array(60)].map((_, i) => (
            <div key={i} className={`absolute rounded-full ${i % 4 === 0 ? 'w-1 h-1 bg-cyan-400/30 animate-pulse' : i % 4 === 1 ? 'w-2 h-2 bg-purple-400/20 animate-ping' : i % 4 === 2 ? 'w-1 h-1 bg-pink-400/30 animate-bounce' : 'w-1.5 h-1.5 bg-blue-400/20 animate-pulse'}`} style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }} />
          ))}
        </div>
        <div className="absolute top-1/4 left-1/6 w-40 h-40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/6 w-48 h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {step === 'intro' && (
          <div className="animate-fade-in max-w-6xl mx-auto">
            {/* Logo Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-3 mb-6 px-6 py-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-full">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-bold text-cyan-300">Master Student</span>
              </div>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-cyan-500/50">
                    <Crown className="h-12 w-12 text-white" />
                  </div>
                  <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-yellow-400 animate-bounce" />
                  <Flame className="h-8 w-8 absolute -bottom-2 -left-2 text-orange-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">Become a Topper! 🌟</h1>
              <p className="text-xl text-gray-300 mb-2">Join the elite community of knowledge creators</p>
              <p className="text-gray-400">Upload your competitive exam results and unlock exclusive VIP features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {[{ stat: '500+', label: 'Verified Toppers', icon: '👥' }, { stat: '10K+', label: 'Downloads', icon: '📥' }, { stat: '4.8★', label: 'Average Rating', icon: '⭐' }].map((item, i) => (
                <Card key={i} className="bg-white border-2 border-gray-200 hover:shadow-lg transition-all hover:border-cyan-400">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="text-3xl font-bold text-gray-800 mb-2">{item.stat}</div>
                    <p className="text-gray-600 text-sm font-semibold">{item.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <button onClick={() => setStep('form')} className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 font-bold text-lg shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center justify-center gap-2 mx-auto hover:scale-105 group">
                <Crown className="h-5 w-5" />
                Start Verification Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-gray-400 text-sm mt-4">Takes only 2-3 minutes to complete</p>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="animate-fade-in max-w-2xl mx-auto">
            <button onClick={() => setStep('intro')} className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors mb-6">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Overview
            </button>
            <h2 className="text-4xl font-bold text-white mb-2">Upload Your Results</h2>
            <p className="text-gray-400 mb-8">Verify your credentials to become a VIP topper</p>

            <Card className="bg-white border-2 border-gray-200 shadow-xl">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Upload className="h-4 w-4 text-cyan-600" />
                      📄 Upload Exam Results (PDF/Image)
                    </label>
                    <input type="file" name="examResults" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className="w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-cyan-300 rounded-xl text-gray-700 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-100 file:text-cyan-700 hover:file:bg-cyan-200 cursor-pointer" />
                    {errors.examResults && <p className="text-red-600 text-xs mt-2 font-semibold">{errors.examResults}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-cyan-600" />
                      📚 Subject/Stream
                    </label>
                    <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="e.g., Mathematics, Physics, Medical" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300" />
                    {errors.subject && <p className="text-red-600 text-xs mt-2 font-semibold">{errors.subject}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-600" />
                      🎯 Score/Percentage
                    </label>
                    <input type="text" name="score" value={formData.score} onChange={handleInputChange} placeholder="e.g., 95%, 450/500, 99.5 percentile" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300" />
                    {errors.score && <p className="text-red-600 text-xs mt-2 font-semibold">{errors.score}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-cyan-600" />
                      📋 Exam Name
                    </label>
                    <input type="text" name="examName" value={formData.examName} onChange={handleInputChange} placeholder="e.g., JEE Main, NEET, CBSE Board, GATE" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all duration-300" />
                    {errors.examName && <p className="text-red-600 text-xs mt-2 font-semibold">{errors.examName}</p>}
                  </div>

                  {errors.submit && <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm font-semibold">{errors.submit}</div>}

                  <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setStep('intro')} className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-xl transition-all duration-300 font-semibold hover:shadow-md">Cancel</button>
                    <button type="submit" className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50">
                      <CheckCircle className="h-4 w-4" />
                      Verify Now
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 'uploading' && (
          <div className="animate-fade-in max-w-2xl mx-auto text-center py-20">
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
                  <Upload className="h-12 w-12 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Uploading Your Results</h3>
            <p className="text-gray-400 mb-8">Please wait while we process your exam results...</p>
            <div className="max-w-xs mx-auto mb-6">
              <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden border border-cyan-500/30">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <p className="text-cyan-400 text-lg font-semibold mt-4">{uploadProgress}%</p>
            </div>
            <div className="flex justify-center gap-2 mt-12">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
              ))}
            </div>
          </div>
        )}

        {step === 'verifying' && (
          <div className="animate-fade-in max-w-2xl mx-auto text-center py-20">
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
                  <Sparkles className="h-12 w-12 text-purple-400 animate-spin" />
                </div>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">Verifying Your Credentials</h3>
            <p className="text-gray-400 mb-8">Our team is reviewing your exam results...</p>
            <div className="max-w-xs mx-auto space-y-4 text-left">
              {[{ label: 'Checking document authenticity', delay: 0 }, { label: 'Verifying exam details', delay: 0.3 }, { label: 'Processing credentials', delay: 0.6 }].map((item, i) => (
                <div key={i} className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${item.delay}s` }}>
                  <div className="w-6 h-6 rounded-full border-2 border-purple-400 flex items-center justify-center animate-pulse">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  </div>
                  <span className="text-gray-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-fade-in max-w-2xl mx-auto text-center py-20">
            <div className="flex justify-center mb-8">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full animate-pulse shadow-2xl shadow-yellow-500/50"></div>
                <div className="absolute inset-4 bg-slate-900 rounded-full flex items-center justify-center">
                  <Trophy className="h-12 w-12 text-yellow-400 animate-bounce" />
                </div>
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">🎉 Congratulations!</h3>
            <p className="text-gray-300 mb-8 text-lg">You've been verified as a Topper!</p>
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
            <button onClick={() => window.location.href = '/home'} className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 flex items-center justify-center gap-2 mx-auto hover:scale-105">
              <Sparkles className="h-5 w-5" />
              Start Earning as a Topper! 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
