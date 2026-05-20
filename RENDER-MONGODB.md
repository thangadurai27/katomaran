# Fix MongoDB on Render (EBADNAME _mongodb._tcp.123)

## Why this error happens

```
querySrv EBADNAME _mongodb._tcp.123>
```

Your password is `Snaplink@123`. The **`@` in the password** breaks the URL if you paste it raw:

```
...Snaplink@123@snaplink-cluster...
         ↑ MongoDB thinks password ends here → host becomes "123@snaplink..."
```

## What to do in Render (step by step)

1. Open https://dashboard.render.com
2. Click your service **katomaran-y789** (or your backend name)
3. Left menu → **Environment**
4. Find **`MONGODB_URI`**
   - Click **Edit** (pencil) or delete the row and add again
5. **Delete the entire old value**
6. Paste **exactly** this one line (no quotes, no spaces before/after):

```
mongodb+srv://snaplinkadmin:Snaplink%40123@snaplink-cluster.b7j73vn.mongodb.net/katomaran?retryWrites=true&w=majority&appName=snaplink-cluster
```

Note: `%40` is the encoded `@` in the password.

7. Click **Save Changes**
8. Render will ask to redeploy → click **Deploy** (or wait for auto deploy)
9. After 1–2 minutes, open: https://katomaran-y789.onrender.com/health  
   - You want: `"mongo": "connected"`

## MongoDB Atlas (do once)

1. https://cloud.mongodb.com → your project
2. **Network Access** → **+ ADD IP ADDRESS** → **ALLOW ACCESS FROM ANYWHERE** (`0.0.0.0/0`) → Confirm
3. **Database Access** → user `snaplinkadmin` must exist

## Do NOT

- Do not wrap the URI in `"` quotes in Render
- Do not use `Snaplink@123` in the URI — use `Snaplink%40123`
- Do not commit this URI to GitHub

## After it works

Rotate the database password in Atlas (it was shared in chat), then update `MONGODB_URI` on Render with the new encoded password.
