import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to users list
    const usersRaw = localStorage.getItem('uns_users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    
    // Prevent registering with admin email
    if (email === 'unshomecleaningproductspvtltd@gmail.com') {
      alert('This email is reserved for administration.');
      return;
    }
    
    if (users.some((u: any) => u.email === email)) {
      alert('User with this email already exists.');
      return;
    }

    const newUser = { name, email, phone, password, role: 'user' };
    users.push(newUser);
    localStorage.setItem('uns_users', JSON.stringify(users));

    // Log in user immediately
    const currentUser = { name, email, phone, role: 'user' };
    localStorage.setItem('uns_current_user', JSON.stringify(currentUser));
    window.dispatchEvent(new Event('authChange'));

    alert('Account registered successfully!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-block">
          <img src={logoImg} alt="UNS Logo" className="h-16 w-auto object-contain mx-auto bg-white p-1 rounded-xl shadow-sm border border-border" />
        </Link>
        <h2 className="mt-6 text-center text-2xl font-extrabold font-heading text-heading">
          Create Your UNS Account
        </h2>
        <p className="mt-2 text-center text-xs text-muted">
          Or{' '}
          <Link to="/signin" className="font-semibold text-primary hover:text-primary-light">
            sign in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md" data-aos="fade-up">
        <div className="bg-white py-8 px-4 shadow-soft border border-border sm:rounded-2xl sm:px-10">
          <button
            type="button"
            onClick={() => alert('Google Sign-Up is not configured for this demo.')}
            className="w-full flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-xs transition-all hover:border-slate-400 active:scale-[0.99] mb-5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span className="font-medium text-slate-700">Sign up with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-muted">Or register with email</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleRegister}>
            
            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@example.com"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 7396158011"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-primary"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-border rounded-lg py-2 pl-10 pr-3 text-xs focus:outline-none focus:border-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              </div>
            </div>

            <div className="flex items-center text-[10px] text-muted font-medium py-1">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary focus:ring-primary border-slate-300 rounded cursor-pointer"
                defaultChecked
              />
              <label htmlFor="terms" className="ml-2 block cursor-pointer">
                I agree to the <a href="#" className="font-semibold text-primary hover:underline">Terms of Service</a> and <a href="#" className="font-semibold text-primary hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-6 rounded-lg text-xs shadow transition-colors flex items-center justify-center gap-1"
            >
              Register Account <ArrowRight size={14} />
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};
export default SignUp;
