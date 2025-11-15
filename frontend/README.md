# ShareBite Frontend

React frontend for ShareBite food waste management platform.

## Development

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env` file in the `frontend` directory:

```
VITE_API_BASE=http://127.0.0.1:8000
```

For production, set `VITE_API_BASE` to your deployed backend URL.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Deploying to Render

1. Connect your repository to Render
2. Create a new Static Site
3. Set the following:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Environment Variable**: 
     - Key: `VITE_API_BASE`
     - Value: `https://your-backend-url.onrender.com`

4. Deploy!

Alternatively, if you're using the `render.yaml` file in the root:
- Render will automatically detect and use it
- Make sure to update the `VITE_API_BASE` value in `render.yaml` with your actual backend URL
