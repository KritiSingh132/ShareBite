import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api, setAuthToken, getRole, listNotifications, markNotificationRead } from './api'
import './App.css'

function Login() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const next = searchParams.get('next') || ''
	const roleHint = searchParams.get('role') || ''
	async function onSubmit(e) {
		e.preventDefault()
		const form = new FormData(e.currentTarget)
		const username = form.get('username')
		const password = form.get('password')
		try {
			const { data } = await api.post('/api/accounts/auth/token/', { username, password })
			setAuthToken(data.access)
			if (next) {
				navigate(next)
				return
			}
			navigate('/dashboard')
		} catch (err) {
			alert('Login failed')
		}
	}
	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-md-4">
					<h3 className="mb-1">Login</h3>
					{roleHint && <div className="text-body-secondary small mb-3">Role-based login for: <strong className="text-capitalize">{roleHint.replace('_',' ')}</strong></div>}
					<form id="login-form" onSubmit={onSubmit}>
						<div className="mb-3">
							<label className="form-label">Username</label>
							<input className="form-control" name="username" required />
						</div>
						<div className="mb-3">
							<label className="form-label">Password</label>
							<input type="password" className="form-control" name="password" required />
						</div>
						<button className="btn btn-primary w-100" type="submit">Sign in</button>
					</form>
					<div className="mt-3 text-center">
						<Link to="/register">Create account</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

function Register() {
	const [searchParams] = useSearchParams()
	const roleHint = searchParams.get('role') || ''
	const navigate = useNavigate()

	async function onSubmitNGO(e) {
		e.preventDefault()
		const form = new FormData(e.currentTarget)
		const payload = {
			username: String(form.get('username') || ''),
			email: String(form.get('email') || ''),
			password: String(form.get('password') || ''),
			organization_name: String(form.get('organization_name') || ''),
			phone: String(form.get('phone') || ''),
			address: String(form.get('address') || ''),
			latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
			longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
		}
		try {
			await api.post('/api/accounts/register/ngo/', payload)
			alert('Registration submitted. Please login once approved.')
			navigate('/login?role=ngo')
		} catch (err) {
			// Backend endpoint may not exist yet; simulate success for now
			alert('Registration submitted (demo). Admin approval required. Please login after approval.')
			navigate('/login?role=ngo')
		}
	}

	if (roleHint === 'ngo') {
		return (
			<div className="container py-5">
				<h3 className="mb-3">Register NGO</h3>
				<form className="col-md-8" onSubmit={onSubmitNGO}>
					<div className="row g-3">
						<div className="col-md-6">
							<label className="form-label">Organization Name</label>
							<input className="form-control" name="organization_name" required />
						</div>
						<div className="col-md-6">
							<label className="form-label">Phone</label>
							<input className="form-control" name="phone" />
						</div>
						<div className="col-12">
							<label className="form-label">Address</label>
							<input className="form-control" name="address" />
						</div>
						<div className="col-md-6">
							<label className="form-label">Latitude</label>
							<input type="number" step="0.000001" className="form-control" name="latitude" />
						</div>
						<div className="col-md-6">
							<label className="form-label">Longitude</label>
							<input type="number" step="0.000001" className="form-control" name="longitude" />
						</div>
						<div className="col-md-4">
							<label className="form-label">Username</label>
							<input className="form-control" name="username" required />
						</div>
						<div className="col-md-4">
							<label className="form-label">Email</label>
							<input type="email" className="form-control" name="email" />
						</div>
						<div className="col-md-4">
							<label className="form-label">Password</label>
							<input type="password" className="form-control" name="password" required />
						</div>
					</div>
					<div className="mt-3">
						<button className="btn btn-primary" type="submit">Submit</button>
						<Link to="/" className="btn btn-link ms-2">Cancel</Link>
					</div>
				</form>
			</div>
		)
	}

	return (
		<div className="container py-5">
			<h3>Register</h3>
			<p>Coming soon…</p>
		</div>
	)
}

function Dashboard() {
	return (
		<div className="container py-4">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>Dashboard</h4>
				<Link className="btn btn-outline-secondary" to="/logout">Logout</Link>
			</div>
			<div className="row g-3">
				<div className="col-md-4">
					<div className="card p-3">Donations</div>
				</div>
				<div className="col-md-4">
					<div className="card p-3">Requests</div>
				</div>
				<div className="col-md-4">
					<div className="card p-3">Deliveries</div>
				</div>
			</div>
		</div>
	)
}

function ProtectedRoute({ children }) {
	const hasToken = !!localStorage.getItem('sb_access')
	return hasToken ? children : <Navigate to="/login" replace />
}

function DonationsList() {
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		api.get('/api/donations/items/').then(({ data }) => setItems(data)).finally(() => setLoading(false))
	}, [])
	return (
		<div className="container py-4">
			<div className="d-flex justify-content-between align-items-center mb-3">
				<h4>Donations</h4>
				<Link className="btn btn-primary" to="/donations/new">New Donation</Link>
			</div>
			{loading ? <div>Loading…</div> : (
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Title</th>
							<th>Quantity</th>
							<th>Status</th>
							<th>Created</th>
						</tr>
					</thead>
					<tbody>
						{items.map((d) => (
							<tr key={d.id}>
								<td>{d.food_type || d.title}</td>
								<td>{d.quantity}</td>
								<td>{d.status}</td>
								<td>{new Date(d.created_at).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	)
}

function DonationForm() {
	const navigate = useNavigate()
	async function onSubmit(e) {
		e.preventDefault()
		const form = new FormData(e.currentTarget)
		const expiryRaw = form.get('expiry')
		const payload = {
			food_type: String(form.get('food_type') || ''),
			description: String(form.get('description') || ''),
			quantity: Number(form.get('quantity') || 0),
			expiry: expiryRaw ? new Date(String(expiryRaw)).toISOString() : null,
			pickup_address: String(form.get('pickup_address') || ''),
			latitude: form.get('latitude') ? Number(form.get('latitude')) : null,
			longitude: form.get('longitude') ? Number(form.get('longitude')) : null,
			notes: String(form.get('notes') || ''),
		}
		try {
			await api.post('/api/donations/items/', payload)
			navigate('/donations')
		} catch (err) {
			alert('Failed to create donation')
		}
	}
	return (
		<div className="container py-4">
			<h4 className="mb-3">New Donation</h4>
			<form onSubmit={onSubmit} className="col-md-8">
				<div className="row g-3">
					<div className="col-md-6">
						<label className="form-label">Food Type / Title</label>
						<input className="form-control" name="food_type" required />
					</div>
					<div className="col-md-3">
						<label className="form-label">Quantity</label>
						<input type="number" className="form-control" name="quantity" min={1} required />
					</div>
					<div className="col-md-3">
						<label className="form-label">Expiry</label>
						<input type="datetime-local" className="form-control" name="expiry" />
					</div>
					<div className="col-12">
						<label className="form-label">Description</label>
						<textarea className="form-control" name="description" rows={3} />
					</div>
					<div className="col-12">
						<label className="form-label">Pickup Address</label>
						<input className="form-control" name="pickup_address" />
					</div>
					<div className="col-md-6">
						<label className="form-label">Latitude</label>
						<input type="number" step="0.000001" className="form-control" name="latitude" />
					</div>
					<div className="col-md-6">
						<label className="form-label">Longitude</label>
						<input type="number" step="0.000001" className="form-control" name="longitude" />
					</div>
					<div className="col-12">
						<label className="form-label">Notes</label>
						<textarea className="form-control" name="notes" rows={2} />
					</div>
				</div>
				<div className="mt-3">
					<button className="btn btn-primary" type="submit">Save</button>
					<Link to="/donations" className="btn btn-link ms-2">Cancel</Link>
				</div>
			</form>
		</div>
	)
}

function DeliveryAgentScan() {
	const [file, setFile] = useState(null);
	const [result, setResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	async function onSubmit(e) {
		e.preventDefault();
		setError('');
		setResult(null);
		if (!file) return setError('Select a food image.');
		setLoading(true);
		try {
			const { label, confidence, metrics, engine } = await import('./api').then(api => api.scanFoodImage(file));
			setResult({ label, confidence, metrics, engine });
		} catch (err) {
			setError('Scan failed. Try again.');
		}
		setLoading(false);
	}

	return (
		<div className="container py-4">
			<h4 className="mb-3">Delivery Agent Food Scan</h4>
			<form onSubmit={onSubmit} className="col-md-6">
				<div className="mb-3">
					<label className="form-label">Upload food image before delivery</label>
					<input type="file" accept="image/*" className="form-control" onChange={e => setFile(e.target.files?.[0] || null)} />
				</div>
				<button className="btn btn-success" disabled={loading || !file}>Scan</button>
				{error && <div className="text-danger small mt-2">{error}</div>}
			</form>
			{result && (
				<div className="card shadow-sm rounded-4 mt-3 col-md-6">
					<div className="card-body">
						<div className="d-flex align-items-center justify-content-between">
							<div>
								<div className="small text-body-secondary">Classification</div>
								<div className="fs-5 text-capitalize fw-semibold">{result.label}</div>
							</div>
							<div className="text-end">
								<div className="small text-body-secondary">Confidence</div>
								<div className="fs-5">{(result.confidence * 100).toFixed(0)}%</div>
							</div>
						</div>
						<div className="mt-3 small text-body-secondary">
							<div>Engine: {result.engine}</div>
							{result.metrics && Object.keys(result.metrics).map(key => (
								<div key={key}>{key}: {String(result.metrics[key])}</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const role = getRole()
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    listNotifications().then((data)=>setItems(data)).finally(()=>setLoading(false))
  }, [])

  async function markRead(id) {
    await markNotificationRead(id, true)
    setItems((prev)=>prev.map(n=> n.id===id ? { ...n, is_read: true } : n))
  }

  if (role !== 'delivery_agent') return <Navigate to="/login" replace />

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Notifications</h4>
        <button className="btn btn-outline-success" onClick={()=>navigate('/delivery/scan')}>Open Scan</button>
      </div>
      {loading ? <div>Loading…</div> : (
        <ul className="list-group">
          {items.length===0 && <li className="list-group-item text-body-secondary">No notifications</li>}
          {items.map(n => (
            <li key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <div>{n.message}</div>
                <div className="small text-body-secondary">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              <div>
                {!n.is_read && <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>markRead(n.id)}>Mark read</button>}
                <button className="btn btn-sm btn-success" onClick={()=>navigate('/delivery/scan')}>Scan</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function App() {
	const role = getRole()
	return (
		<BrowserRouter>
			<nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm">
				<div className="container">
					<Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
						<span className="text-success">Share</span><span className="text-warning">Bite</span>
					</Link>
					<div className="collapse navbar-collapse">
						<ul className="navbar-nav ms-auto align-items-lg-center">
							<li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
							{role === 'restaurant' && <li className="nav-item"><Link className="nav-link" to="/restaurants">Restaurants</Link></li>}
							{role === 'ngo' && <li className="nav-item"><Link className="nav-link" to="/ngo">NGOs</Link></li>}
							<li className="nav-item"><Link className="nav-link" to="/donations">Donations</Link></li>
							{role === 'delivery_agent' && <li className="nav-item"><Link className="nav-link" to="/notifications">Notifications</Link></li>}
							{role === 'delivery_agent' && <li className="nav-item"><Link className="nav-link" to="/delivery/scan">Scan</Link></li>}
							<li className="nav-item"><Link className="btn btn-sm btn-outline-primary ms-2" to="/login">Login</Link></li>
						</ul>
					</div>
				</div>
			</nav>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
				<Route path="/donations" element={<ProtectedRoute><DonationsPage /></ProtectedRoute>} />
				<Route path="/donations/new" element={<ProtectedRoute><DonationForm /></ProtectedRoute>} />
				<Route path="/restaurants" element={<ProtectedRoute><RestaurantPage /></ProtectedRoute>} />
				<Route path="/ngo" element={<ProtectedRoute><NGOPage /></ProtectedRoute>} />
				<Route path="/delivery/scan" element={<ProtectedRoute><DeliveryAgentScan /></ProtectedRoute>} />
				<Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
				<Route path="/logout" element={<Logout />} />
			</Routes>
			<Footer />
		</BrowserRouter>
	)
}

function Logout() {
	useEffect(() => {
		setAuthToken(null)
	}, [])
	return <Navigate to="/login" replace />
}

function Home() {
	return (
		<div className="bg-body-tertiary">
			{/* Hero */}
			<section className="container py-4">
				<div
					className="rounded-4 overflow-hidden position-relative"
					style={{
						backgroundImage:
							"url('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop')",
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						height: 320,
					}}
				>
					<div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'rgba(0,0,0,0.35)' }} />
					<div className="position-absolute top-50 start-50 translate-middle text-white text-center px-3">
						<h1 className="fw-bold display-5">Reduce Food Waste. Feed Communities.</h1>
						<div className="mt-3 d-flex gap-3 justify-content-center">
							<Link to="/donations/new" className="btn btn-success btn-lg">Post Donation</Link>
							<Link to="/login?role=ngo&next=/ngo" className="btn btn-warning btn-lg">Request Food</Link>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="container pb-4">
				<h5 className="mb-3">Features</h5>
				<div className="row g-3">
					<FeatureCard icon="bi-geo-alt" title="Live Tracking" desc="Track delivery routes live." />
					<FeatureCard icon="bi-calendar-check" title="Food Expiry Prediction" desc="Scan and assess freshness." />
					<FeatureCard icon="bi-shield-lock" title="Role-Based Access" desc="Secure access for all roles." />
					<FeatureCard icon="bi-bell" title="Notifications" desc="Email/SMS on key events." />
				</div>
			</section>

			{/* Map */}
			<section className="container pb-5">
				<div className="card border-0 shadow-sm">
					<div className="card-body">
						<h6 className="mb-3">Live Delivery Tracking</h6>
						<div className="ratio ratio-16x9 rounded-3 overflow-hidden">
							<iframe
								title="map"
								src="https://www.openstreetmap.org/export/embed.html?bbox=77.2%2C28.6%2C77.3%2C28.7&layer=mapnik"
								style={{ border: 0 }}
							/>
						</div>
					</div>
				</div>
			</section>
		</div>
	)
}

function FeatureCard({ icon, title, desc }) {
	return (
		<div className="col-12 col-md-6 col-lg-3">
			<div className="p-3 bg-white rounded-4 shadow-sm h-100 text-center">
				<div className="fs-2 text-success mb-2"><i className={`bi ${icon}`}></i></div>
				<div className="fw-semibold">{title}</div>
				<div className="text-body-secondary small">{desc}</div>
			</div>
		</div>
	)
}

function Footer() {
	return (
		<footer className="border-top py-3 bg-white">
			<div className="container d-flex justify-content-between align-items-center">
				<div className="fw-bold"><span className="text-success">Share</span><span className="text-warning">Bite</span></div>
				<nav className="d-flex gap-3 small">
					<a href="#" className="text-decoration-none">Privacy Policy</a>
					<a href="#" className="text-decoration-none">Terms</a>
					<a href="#" className="text-decoration-none">Contact</a>
				</nav>
			</div>
		</footer>
	)
}

function DeliveriesSidebar() {
	return (
		<div className="list-group shadow-sm rounded-4">
			<div className="list-group-item fw-semibold">Delivery Agent Panel</div>
			<Link className="list-group-item list-group-item-action" to="/dashboard">Dashboard</Link>
			<Link className="list-group-item list-group-item-action" to="/donations">My Donations</Link>
			<Link className="list-group-item list-group-item-action" to="/delivery/scan">Scan Food Before Delivery</Link>
			<Link className="list-group-item list-group-item-action" to="/logout">Logout</Link>
		</div>
	);
}

function RestaurantPage() {
	const navigate = useNavigate();

	return (
		<div className="container py-4">
			<div className="row g-4 align-items-start">
				{/* Sidebar */}
				<aside className="col-12 col-lg-3 mb-4 mb-lg-0">
					<div className="card shadow-sm rounded-4 mb-3">
						<div className="card-body">
							<div className="fw-semibold mb-2">The Daily Bread Bistro</div>
							<ul className="list-group list-group-flush">
								<li className="list-group-item px-0"><Link to="/dashboard" className="text-decoration-none">Dashboard</Link></li>
								<li className="list-group-item px-0"><Link to="/donations" className="text-decoration-none">My Donations</Link></li>
								<li className="list-group-item px-0"><Link to="/logout" className="text-decoration-none">Logout</Link></li>
							</ul>
						</div>
					</div>
					<button className="btn btn-success btn-lg w-100 shadow-sm mb-4" onClick={()=>navigate('/donations/new')}>Create Donation</button>
				</aside>

				{/* Main panel */}
				<main className="col-12 col-lg-6">
					<div className="card shadow-sm rounded-4 mb-3">
						<div className="card-body p-4">
							<div className="mb-3" style={{filter:'blur(2px)', opacity:0.8}}>
								{/* Blurred/fake summary info, replace with live data if wanted */}
								<strong>Some Blurred Stats</strong><br/>...
							</div>
							<h5>Post Donation</h5>
							<button className="btn btn-success mt-2" onClick={()=>navigate('/donations/new')}>Create Donation</button>
						</div>
					</div>
					<div className="card shadow-sm rounded-4 mb-4">
						<div className="card-body p-4">
							<h5 className="mb-3">My Current Donations</h5>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<span>Donations</span>
								<button className="btn btn-primary" onClick={()=>navigate('/donations/new')}>New Donation</button>
							</div>
							{/* Could insert DonationsList() here if needed */}
							<div className="text-muted">No donations to display.</div>
						</div>
					</div>
					<div className="mt-4">
						<h4>Featured Local Restaurants</h4>
						{(() => {
							const featured = [
								{ name: 'Restaurant', city: 'Varanasi', img: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80' },
								{ name: 'Restaurant', city: 'Delhi', img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80' },
								{ name: 'Restaurant', city: 'Mumbai', img: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80' },
							];
							const viewRestaurant = (r) => {
								const q = encodeURIComponent(`${r.name} ${r.city}`);
								window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank');
							};
							return (
								<div className="d-flex gap-3 mt-3 flex-nowrap" style={{overflowX:'auto'}}>
									{featured.map((r, idx) => (
										<div className="card rounded-4" style={{minWidth:'260px'}} key={idx}>
											<div role="button" onClick={() => viewRestaurant(r)}>
												<img src={r.img} alt={r.name} className="img-fluid rounded-top-4" style={{height:160, width:'100%', objectFit:'cover'}} />
											</div>
											<div className="card-body text-center">
												<div className="fw-semibold">{r.name}</div>
												<div className="text-body-secondary small mb-2">{r.city}</div>
												<button className="btn btn-sm btn-outline-success" onClick={() => viewRestaurant(r)}>View</button>
											</div>
										</div>
									))}
								</div>
							);
						})()}
					</div>
				</main>

				{/* Notifications */}
				<section className="col-12 col-lg-3">
					<div className="card shadow-sm rounded-4 mb-4">
						<div className="card-body">
							<h5 className="fw-semibold">Notifications</h5>
							<ul className="list-unstyled small mb-0 mt-3">
								<li className="mb-2"><span className="text-warning">●</span> NGO "Hopeful Hearts" requested 10kg Rice.</li>
								<li className="mb-2">Delivery Agent assigned to pickup at 5:30 PM.</li>
								<li>Donation D 102 marked as distributed.</li>
							</ul>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

function NGOPage() {
	const [items, setItems] = useState([])
	const [loading, setLoading] = useState(true)
	const [tab, setTab] = useState('requests')
	useEffect(() => {
		api.get('/api/donations/items/').then(({ data }) => setItems(Array.isArray(data) ? data : (data.value || []))).finally(() => setLoading(false))
	}, [])

	async function requestDonation(id) {
		try {
			await api.post('/api/donations/requests/', { donation: id, message: 'Request by NGO' })
			alert('Request placed. Delivery agent has been notified for pickup.')
		} catch (e) {
			alert('Request failed')
		}
	}

	const registeredNgos = [
		{ name: 'Community Care Foundation', city: 'Delhi', img: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80&auto=format&fit=crop' },
		{ name: 'Hopeful Hearts', city: 'Mumbai', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop' },
		{ name: 'Helping Hands Trust', city: 'Varanasi', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&auto=format&fit=crop' },
	]

	return (
		<div className="container py-4">
			<div className="row g-3">
				<aside className="col-12 col-lg-3">
					<div className="list-group shadow-sm rounded-4">
						<div className="list-group-item fw-semibold">NGO Panel</div>
						<button className={`list-group-item list-group-item-action ${tab==='requests'?'active':''}`} onClick={()=>setTab('requests')}>Requests</button>
						<button className={`list-group-item list-group-item-action ${tab==='ngos'?'active':''}`} onClick={()=>setTab('ngos')}>NGOs</button>
						<Link className="list-group-item list-group-item-action" to="/register?role=ngo">Register NGO</Link>
						<Link className="list-group-item list-group-item-action" to="/logout">Logout</Link>
					</div>
				</aside>
				<main className="col-12 col-lg-6">
					{tab==='requests' ? (
						<div className="card border-0 shadow-sm rounded-4 mb-3">
							<div className="card-body">
								<h5 className="mb-3">Available Food Donations</h5>
								{loading ? <div>Loading…</div> : (
									<table className="table table-hover">
										<thead>
											<tr>
												<th>Title</th>
												<th>Quantity</th>
												<th>Status</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{items.map((d) => (
												<tr key={d.id}>
													<td>{d.food_type || d.title}</td>
													<td>{d.quantity}</td>
													<td><span className="badge text-bg-success">{d.status}</span></td>
													<td className="text-end"><button className="btn btn-sm btn-outline-success" onClick={() => requestDonation(d.id)}>Request</button></td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
						</div>
					) : (
						<div className="card border-0 shadow-sm rounded-4">
							<div className="card-body">
								<h5 className="mb-3">Registered NGOs</h5>
								<div className="row g-3">
									{registeredNgos.map((n, i) => (
										<div className="col-12 col-md-6" key={i}>
											<div className="card h-100">
												<img src={n.img} alt={n.name} className="card-img-top" style={{height:140, objectFit:'cover'}} onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://via.placeholder.com/800x140?text=NGO'; }} />
												<div className="card-body d-flex justify-content-between align-items-center">
													<div>
														<div className="fw-semibold">{n.name}</div>
														<div className="text-body-secondary small">{n.city}</div>
													</div>
													<a className="btn btn-sm btn-outline-primary" href="/register?role=ngo">Join</a>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</main>
				<section className="col-12 col-lg-3">
					<div className="card border-0 shadow-sm rounded-4">
						<div className="card-body">
							<h6 className="mb-3">Live Tracking</h6>
							<div className="ratio ratio-16x9 rounded-3 overflow-hidden">
								<iframe title="map" src="https://www.openstreetmap.org/export/embed.html?bbox=77.2%2C28.6%2C77.3%2C28.7&layer=mapnik" style={{ border: 0 }} />
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	)
}

function DonationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/api/donations/items/')
      .then(({ data }) => setItems(Array.isArray(data) ? data : (data.value || [])))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((d) => {
    const str = `${d.food_type || d.title || ''} ${d.description || ''} ${d.status || ''}`.toLowerCase();
    return str.includes(query.toLowerCase());
  });

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1 py-4" style={{background:'#fafbfc'}}>
        <div className="container" style={{maxWidth:1100}}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold mb-0">Donations</h2>
            <button className="btn btn-primary" onClick={()=>navigate('/donations/new')}>New Donation</button>
          </div>

          <div className="row g-3 align-items-end mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label fw-semibold">Search</label>
              <input type="text" className="form-control" placeholder="Search donations..." value={query} onChange={(e)=>setQuery(e.target.value)} />
            </div>
          </div>

          <div className="card shadow-sm rounded-4">
            <div className="card-body p-0">
              {loading ? (
                <div className="p-3">Loading…</div>
              ) : (
                <div className="table-responsive">
                  <table className="table mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Restaurant</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 && (
                        <tr><td colSpan={5} className="text-center text-body-secondary py-4">No donations to display.</td></tr>
                      )}
                      {filtered.map((d) => (
                        <tr key={d.id}>
                          <td>{d.food_type || d.title}</td>
                          <td>{d.quantity}</td>
                          <td><span className={`badge ${d.status==='available' ? 'text-bg-success' : 'text-bg-secondary'}`}>{d.status}</span></td>
                          <td>{d.restaurant}</td>
                          <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <footer className="container d-flex justify-content-end align-items-center py-3">
        <nav className="d-flex gap-3 small">
          <a href="#" className="text-decoration-none">Privacy Policy</a>
          <a href="#" className="text-decoration-none">Terms</a>
          <a href="#" className="text-decoration-none">Contact</a>
        </nav>
      </footer>
    </div>
  );
}
