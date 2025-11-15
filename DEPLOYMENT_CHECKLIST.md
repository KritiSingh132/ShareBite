# 🚀 Production Deployment Checklist

Since you've already deployed your backend and frontend, use this checklist to ensure everything is properly configured for production.

## ✅ Backend Configuration (Render Web Service)

### Environment Variables to Set in Render Dashboard:

1. **SECRET_KEY** (Required)
   - Generate a new secret key: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`
   - Set in Render: `SECRET_KEY=<your-generated-key>`

2. **DEBUG** (Required)
   - Set to: `DEBUG=False`
   - This disables debug mode for security

3. **ALLOWED_HOSTS** (Required)
   - Set to your backend URL: `ALLOWED_HOSTS=your-backend-name.onrender.com`
   - If multiple domains: `ALLOWED_HOSTS=backend1.onrender.com,backend2.example.com`

4. **DATABASE_URL** (Already Configured)
   - Your PostgreSQL database URL is already in the code
   - If Render auto-provides this, make sure it's set: `DATABASE_URL=postgresql://...`
   - Note: The current hardcoded URL will work, but using environment variable is better

5. **CORS_ALLOWED_ORIGINS** (Important)
   - Set to your frontend URL: `CORS_ALLOWED_ORIGINS=https://your-frontend-name.onrender.com`
   - If multiple frontends: `CORS_ALLOWED_ORIGINS=https://frontend1.onrender.com,https://frontend2.vercel.app`
   - **This is critical** - without it, your frontend won't be able to make API calls

### Render Configuration:

- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn sharebite.wsgi:application`
- **Python Version**: 3.10+ (specify in `runtime.txt` if needed)

## ✅ Frontend Configuration (Render Static Site)

### Environment Variables to Set in Render Dashboard:

1. **VITE_API_BASE** (Required)
   - Set to your backend URL: `VITE_API_BASE=https://your-backend-name.onrender.com`
   - Make sure it includes `https://` and no trailing slash
   - Example: `VITE_API_BASE=https://sharebite-backend.onrender.com`

### Render Configuration:

- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

## 🔍 Verification Steps

### 1. Test Backend API:
```bash
# Test if backend is accessible
curl https://your-backend-name.onrender.com/api/

# Test if API docs are accessible
curl https://your-backend-name.onrender.com/api/docs/
```

### 2. Test Frontend:
- Visit your frontend URL: `https://your-frontend-name.onrender.com`
- Check browser console (F12) for any CORS errors
- Try to login or make an API call
- Check Network tab to see if API calls are going to the correct backend URL

### 3. Test CORS:
- Open your frontend in a browser
- Open Developer Tools (F12) → Console
- Try making a request - you should NOT see CORS errors
- If you see CORS errors, check that `CORS_ALLOWED_ORIGINS` includes your frontend URL

## 🔧 Common Issues & Solutions

### Issue: Frontend shows CORS errors
**Solution**: 
- Make sure `CORS_ALLOWED_ORIGINS` in backend includes your frontend URL
- Format: `https://your-frontend-name.onrender.com` (with https, no trailing slash)
- Redeploy backend after setting the environment variable

### Issue: Frontend can't connect to backend
**Solution**:
- Verify `VITE_API_BASE` is set correctly in frontend environment variables
- Make sure backend URL is accessible (test with curl or browser)
- Check that backend `ALLOWED_HOSTS` includes your backend domain

### Issue: 500 errors on backend
**Solution**:
- Check Render logs for errors
- Make sure `DEBUG=False` and `SECRET_KEY` is set
- Verify database migrations ran: `python manage.py migrate`
- Check if database connection is working

### Issue: Static files not loading
**Solution**:
- Add `whitenoise` to requirements.txt if not already there
- Add to MIDDLEWARE: `'whitenoise.middleware.WhiteNoiseMiddleware'`
- Run: `python manage.py collectstatic --noinput` in build command

## 📝 Quick Setup Commands

### If you need to run migrations on Render:
Add this to your Render build command:
```bash
pip install -r requirements.txt && python manage.py migrate && gunicorn sharebite.wsgi:application
```

### To create a superuser on production:
Use Render's shell feature:
```bash
python manage.py createsuperuser
```

## 🔐 Security Reminders

1. ✅ **Never commit** `SECRET_KEY`, database passwords, or API keys to git
2. ✅ Use environment variables for all sensitive data
3. ✅ Set `DEBUG=False` in production
4. ✅ Use `CORS_ALLOWED_ORIGINS` instead of `CORS_ALLOW_ALL_ORIGINS=True`
5. ✅ Restrict `ALLOWED_HOSTS` to your actual domains
6. ✅ Use HTTPS only in production

## 📞 Your Deployment URLs

**Backend URL**: `https://your-backend-name.onrender.com`
**Frontend URL**: `https://your-frontend-name.onrender.com`
**API Docs**: `https://your-backend-name.onrender.com/api/docs/`

Update this checklist with your actual URLs!

