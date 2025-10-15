import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
	const [mode, setMode] = useState('login');
	const [full_name, setfull_name] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState('');
	const [ok, setOk] = useState(false);

	const isDashboardRoute = typeof window !== 'undefined' && window.location.pathname === '/dashboard';
	const userName = typeof window !== 'undefined' ? (localStorage.getItem('user_full_name') || 'Friend') : 'Friend';

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (isDashboardRoute && !token) {
			window.location.replace('/');
		}
		if (!isDashboardRoute && token && mode === 'login') {
			window.location.replace('/dashboard');
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isDashboardRoute]);

	async function handleSubmit(e) {
		e.preventDefault();
		setMessage('');
		setOk(false);
		try {
			const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
			const body = mode === 'login' ? { email, password } : { full_name, email, password };
			const res = await fetch(`${API_BASE}${endpoint}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Request failed');
			// Backend wraps in { isSuccess, result: { user, token }, message }
			const result = data.result || data;
			if (mode === 'signup') {
				setOk(true);
				setMessage('Signup successful. Please login.');
				setMode('login');
				return;
			}
			// login success -> save token and redirect to dashboard
			if (result.token) localStorage.setItem('token', result.token);
			if (result.user?.full_name) localStorage.setItem('user_full_name', result.user.full_name);
			setOk(true);
			setMessage(`Welcome ${result.user?.full_name || ''}`);
			setTimeout(() => {
				window.location.href = '/dashboard';
			}, 500);
		} catch (err) {
			setOk(false);
			setMessage(err.message || 'Failed to fetch');
		}
	}

	function handleLogout() {
		localStorage.removeItem('token');
		localStorage.removeItem('user_full_name');
		window.location.replace('/');
	}

	return (
		<div className="page">
			<div className="card">
				{isDashboardRoute ? (
					<div className="dashboard">
						<div className="dash-nav">
							<div className="brand">MyApp</div>
							<div className="nav-right">
								<div className="user-chip">
									<div className="avatar" aria-hidden="true">{userName?.[0]?.toUpperCase() || 'U'}</div>
									<span className="user-name">{userName}</span>
								</div>
								<button className="primary" onClick={handleLogout}>Logout</button>
							</div>
						</div>

						<div className="dash-hero">
							<h1>Hello, {userName}</h1>
							<p className="subtitle">Here’s a quick overview of your account today.</p>
						</div>

						<div className="stats">
							<div className="stat">
								<div className="stat-label">Sessionssss</div>
								<div className="stat-value">29</div>
								<div className="stat-trend up">+6 this week</div>
							</div>
							<div className="stat">
								<div className="stat-label">Security</div>
								<div className="stat-value">2FA On</div>
								<div className="stat-trend neutral">All good</div>
							</div>
							<div className="stat">
								<div className="stat-label">Plan</div>
								<div className="stat-value">Free</div>
								<div className="stat-trend">Upgrade anytime</div>
							</div>
						</div>

						<div className="sections">
							<div className="section">
								<h2>Recent Activity</h2>
								<ul className="activity">
									<li>Logged in from Chrome on macOS</li>
									<li>Password changed 2 months ago</li>
									<li>Email verified</li>
								</ul>
							</div>
							<div className="section">
								<h2>Quick Actions</h2>
								<div className="quick-actions">
									<button className="secondary">Update Profile</button>
									<button className="secondary">Change Password</button>
									<button className="secondary">Upgrade Plan</button>
								</div>
							</div>
						</div>
					</div>
				) : (
					<>
						<h1>Welcome</h1>
						<p className="subtitle">Sign in to your account or create a new one</p>
						<div className="tabs">
							<button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button>
							<button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>Sign Up</button>
						</div>

						<form className="form" onSubmit={handleSubmit}>
							{mode === 'signup' && (
								<label>
									<span>Full Name</span>
									<input value={full_name} onChange={(e) => setfull_name(e.target.value)} placeholder="John Doe" />
								</label>
							)}
							<label>
								<span>Email</span>
								<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
							</label>
							<label>
								<span>Password</span>
								<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
							</label>
							<button className="primary" type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
						</form>

						{message && (
							<p className={`message ${ok ? 'success' : 'error'}`}>{message}</p>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default App;
