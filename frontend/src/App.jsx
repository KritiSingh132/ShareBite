import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api, setAuthToken, getRole } from './api'
import './App.css'

function Login() {
	const navigate = useNavigate()
	async function onSubmit(e) {
		e.preventDefault()
		const form = new FormData(e.currentTarget)
		const username = form.get('username')
		const password = form.get('password')
		try {
			const { data } = await api.post('/api/accounts/auth/token/', { username, password })
			setAuthToken(data.access)
			navigate('/dashboard')
		} catch (err) {
			alert('Login failed')
		}
	}
	return (
		<div className="container py-5">
			<div className="row justify-content-center">
				<div className="col-md-4">
					<h3 className="mb-4">Login</h3>
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
		const payload = {
			food_type: form.get('title'),
			description: form.get('description'),
			quantity: Number(form.get('quantity') || 0),
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
			<form onSubmit={onSubmit} className="col-md-6">
				<div className="mb-3">
					<label className="form-label">Title</label>
					<input className="form-control" name="title" required />
				</div>
				<div className="mb-3">
					<label className="form-label">Description</label>
					<textarea className="form-control" name="description" rows={3} />
				</div>
				<div className="mb-3">
					<label className="form-label">Quantity</label>
					<input type="number" className="form-control" name="quantity" min={1} required />
				</div>
				<button className="btn btn-primary" type="submit">Save</button>
				<Link to="/donations" className="btn btn-link ms-2">Cancel</Link>
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
							<Link to="/donations" className="btn btn-warning btn-lg">Request Food</Link>
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
							<button className="btn btn-success mt-2">Create Donation</button>
						</div>
					</div>
					<div className="card shadow-sm rounded-4 mb-4">
						<div className="card-body p-4">
							<h5 className="mb-3">My Current Donations</h5>
							<div className="d-flex justify-content-between align-items-center mb-3">
								<span>Donations</span>
								<button className="btn btn-primary">New Donation</button>
							</div>
							{/* Could insert DonationsList() here if needed */}
							<div className="text-muted">No donations to display.</div>
						</div>
					</div>
					<div className="mt-4">
						<h4>Featured Local Restaurants</h4>
						<div className="d-flex gap-3 mt-3 flex-nowrap" style={{overflowX:'auto'}}>
							{[1,2,3].map((n) => (
								<div className="card rounded-4" style={{minWidth:'220px'}} key={n}>
									<img src={`https://images.unsplash.com/photo-15${n+43}81436-03da8d8c3d09?w=400&q=80`} alt="Restaurant" className="img-fluid rounded-top-4" />
									<div className="card-body text-center">
										<div className="fw-semibold">Sample Restaurant {n}</div>
										<button className="btn btn-sm btn-outline-success mt-2">View</button>
									</div>
								</div>
							))}
						</div>
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
  // Sample data
  const donations = [
    {title:'Pasta Dishes', quantity:'20 Meals', restaurant:'20', status:'Available'},
    {title:'Pasta Dishes', quantity:'50 Meals', restaurant:'40 Fill', status:'0'},
  ];
  const highlights = [
    {img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', text:'Renter P Harlics Domunt'},
    {img:'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=400&q=80', text:'Fole in Mey Dorsetich'},
    {img:'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&q=80', text:'Foad Prenuts Domen Nad'},
  ];

  return (
    <>
      <div className="container py-4">
        <div className="row g-4 align-items-start">
          {/* Sidebar */}
          <aside className="col-12 col-lg-3 mb-4 mb-lg-0">
            <div className="card shadow-sm rounded-4 mb-3">
              <div className="card-body">
                <div className="fw-semibold mb-2">Community Care Foundation</div>
                <div className="input-group mb-2">
                  <span className="input-group-text bg-white border-0"><i className="bi bi-box"></i></span>
                  <span className="form-control border-0 bg-light">Browse Donations</span>
                  <span className="input-group-text bg-white border-0"><i className="bi bi-gift"></i></span>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-white border-0"><i className="bi bi-box-arrow-right"></i></span>
                  <span className="form-control border-0 bg-light">Logout</span>
                </div>
              </div>
            </div>
            <div className="card shadow-sm rounded-4">
              <div className="card-body py-2 d-flex align-items-center">
                <i className="bi bi-box text-success fs-5 me-2"></i> <span>Browse Donations</span>
                <span className="ms-auto text-success fs-5"><i className="bi bi-power"></i></span>
              </div>
            </div>
          </aside>

          {/* Main panel */}
          <main className="col-12 col-lg-6">
            <div className="card shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <h4 className="fw-semibold mb-4">Available Food Donations</h4>
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Quantity</th>
                        <th>Restaurant</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((d, i)=>(
                        <tr key={i}>
                          <td>{d.title}</td>
                          <td>{d.quantity}</td>
                          <td>{d.restaurant}</td>
                          <td><span className="badge bg-success">{d.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>

          {/* Live Tracking panel */}
          <section className="col-12 col-lg-3">
            <div className="card shadow-sm rounded-4 mb-4">
              <div className="card-body">
                <h5 className="fw-semibold mb-3">Live Tracking</h5>
                <img src="https://i.imgur.com/V8BQsXl.png" alt="Map Mini" className="img-fluid rounded-4 border mb-0" style={{minHeight:110, objectFit:'cover'}}/>
              </div>
            </div>
          </section>
        </div>
      </div>
      {/* Recent Donation Highlights */}
      <div className="container pb-5">
        <h5 className="text-center mb-4">Recent Donation Highlights</h5>
        <div className="d-flex gap-4 justify-content-center flex-wrap">
          {highlights.map((h,i)=>(
            <div key={i} className="text-center" style={{width:280}}>
              <div className="bg-white shadow-sm rounded-4 mb-1">
                <img src={h.img} alt="Food highlight" className="img-fluid rounded-4" style={{height:160,objectFit:'cover',width:'100%'}}/>
              </div>
              <div>{h.text}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function DonationsPage() {
  const donations = [
    {title:'Pasta Dishes', quantity:'20 Meals', status:'Available', restaurant:'The Golden Spoon', created:'2024-10-25', icon:'bi-plus', badgeClass:'bg-success'},
    {title:'Canned Goods', quantity:'50 Items', status:'Picked', restaurant:'City Deli', created:'', icon:'bi-dot', badgeClass:'bg-secondary'},
    {title:'Baked Bread', quantity:'50 Items', status:'10 Loaves', restaurant:'Distributed', created:'', icon:'bi-dot', badgeClass:'bg-secondary'},
    {title:'Baked Bread', quantity:'The Daily Bread Bistro', status:'2024-10-25', restaurant:'2024-10-24', created:'', icon:'bi-dot', badgeClass:'bg-secondary'},
  ];

  return (
    <div className="d-flex flex-column min-vh-100">
      <div className="flex-grow-1 py-4 d-flex flex-column align-items-center justify-content-start" style={{background:'#fafbfc'}}>
        <div className="container" style={{maxWidth:1100}}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Donations</h2>
            <button className="btn btn-primary shadow" style={{boxShadow:'0 0 16px #2196f3, 0 0 4px #2196f380'}}>
              New Donation
            </button>
          </div>
          {/* Headers */}
          <div className="row align-items-center mb-3">
            <div className="col fw-bold">Title</div>
            <div className="col fw-bold">Quantity</div>
            <div className="col fw-bold">Status</div>
            <div className="col fw-bold">Restaurant</div>
            <div className="col fw-bold">Created</div>
          </div>
          {/* Search/filter */}
          <div className="d-flex mb-4" style={{maxWidth:380}}>
            <input type="text" className="form-control me-2" placeholder="Search donations..." />
            <button className="btn btn-outline-secondary">Filter</button>
          </div>
          {/* Floating card table */}
          <div className="d-flex justify-content-center">
            <div className="bg-white rounded-4 shadow p-0" style={{minWidth:600,maxWidth:800,marginTop:-30}}>
              <table className="table mb-0 rounded-4 overflow-hidden">
                <thead>
                  <tr style={{background:'#ecf2f7'}}>
                    <th>Title</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Restaurant</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d,i)=>(
                    <tr key={i}>
                      <td>{d.title}</td>
                      <td>{d.quantity}</td>
                      <td><span className={`badge ${d.badgeClass} me-1`}><i className={`bi ${d.icon}`}></i> {d.status}</span></td>
                      <td>{d.restaurant}</td>
                      <td>{d.created}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
