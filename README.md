# APIs


# My Vercel API Backend

Simple API backend for your GitHub Pages projects.

## 🚀 Setup Instructions

### 1. Create GitHub Repository
1. Go to GitHub and create a new repository (e.g., `my-vercel-api`)
2. Clone it locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/my-vercel-api.git
   cd my-vercel-api
   ```

### 2. Add Files
Copy all the files from this structure into your repository.

### 3. Push to GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 4. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `my-vercel-api` repository
4. Vercel will auto-detect the settings
5. Click "Deploy"

### 5. Add Vercel KV Database
1. After deployment, go to your project dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "KV" (Redis)
5. Name it (e.g., `my-api-storage`)
6. Click "Create"
7. Vercel will automatically connect it to your project

### 6. Redeploy
After adding KV, trigger a redeploy by pushing a small change or clicking "Redeploy" in Vercel.

## 📝 Usage Examples

### Counter API (Button/QR Code)
```html

Click Me!
Clicks: 0


async function incrementCounter() {
  const res = await fetch('https://YOUR-PROJECT.vercel.app/api/counter?id=my-button');
  const data = await res.json();
  document.getElementById('count').textContent = data.count;
}

// Load count on page load
incrementCounter();

```

### Visitor Tracker
```html




async function trackVisitor() {
  const res = await fetch('https://YOUR-PROJECT.vercel.app/api/visitor-tracker?page=homepage');
  const data = await res.json();
  document.getElementById('stats').innerHTML = `
    Unique visitors: ${data.uniqueVisitors}
    Your visits: ${data.yourVisits}
    Location: ${data.location}
  `;
}

trackVisitor();

```

### View All Visitors
Visit: `https://YOUR-PROJECT.vercel.app/api/get-visitors?page=homepage`

## ➕ Adding More APIs

Just create a new file in `/api/` folder:

**Example: `/api/hello.js`**
```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello World!' });
}
```

Push to GitHub, and Vercel will auto-deploy!

## 🔗 Your API URL
After deployment, your API will be at:
`https://YOUR-PROJECT-NAME.vercel.app/api/endpoint-name`







https://claude.ai/share/17123417-2053-425f-96aa-046b0c06c180

