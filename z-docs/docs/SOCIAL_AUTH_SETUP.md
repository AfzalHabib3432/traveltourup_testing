# Social login (Google, Facebook, X)

Your app uses **`signInWithOAuth`** + **`/auth/callback`** (PKCE). The error below means Supabase has not accepted that provider’s config yet:

```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

That happens when:

1. The provider toggle is **off**, or  
2. The toggle is **on** but **Save** never succeeded (red validation errors), e.g. empty **Client ID** / **Secret** / **Google Client IDs** with spaces.

---

## 1. Redirect URLs (all providers)

In **Supabase → Authentication → URL configuration**:

| Setting | Value |
|--------|--------|
| **Site URL** | Your app origin, e.g. `http://localhost:3000` or production URL |
| **Redirect URLs** | Add **each** of: `{SITE_URL}/auth/callback`, `{SITE_URL}/auth/update-password` |

Use the same values as `NEXT_PUBLIC_APP_URL` in `.env.local`.

Each OAuth provider’s **developer console** must list Supabase’s callback:

`https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback`

(Copy it from the provider’s panel in Supabase.)

---

## 2. Google

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create **OAuth client ID** (Web application).  
2. **Authorized redirect URIs**: paste Supabase’s **Callback URL (for OAuth)**.  
3. Supabase → **Authentication → Providers → Google**:  
   - Turn **Enable Sign in with Google** **ON**.  
   - **Client IDs**: Web client ID (string, **no spaces**, no commas unless multiple IDs as documented).  
   - **Client secret**: from Google.  
4. Click **Save** with **no red errors**.

---

## 3. Facebook

1. [Meta for Developers](https://developers.facebook.com/) → Create app → add **Facebook Login**.  
2. **Valid OAuth redirect URIs**: Supabase callback URL.  
3. Supabase → **Facebook**: enable, paste **App ID** and **App Secret**, **Save** with no validation errors.

---

## 4. X (Twitter) — OAuth 2.0

1. [X Developer Portal](https://developer.x.com/) → project + app with **User authentication** (**Web App**).  
2. **Callback URL**: Supabase callback URL.  
3. Enable **Request email from users** if you need email in Supabase.  
4. **Keys and tokens** → OAuth 2.0 **Client ID** and **Client Secret**.  
5. Supabase → **X / Twitter (OAuth 2.0)**: turn **X / Twitter enabled** **ON**, paste credentials, **Save**.

In code the provider id is **`x`** (`signInWithOAuth({ provider: 'x' })`).

---

## 5. Quick checklist

- [ ] Each provider shows **green / saved** in Supabase with **no** “required” errors under Client ID / Secret.  
- [ ] Redirect allow list includes `{APP_URL}/auth/callback`.  
- [ ] Google/Microsoft-style **Client IDs** field has no stray spaces.  
- [ ] X provider uses **OAuth 2.0** credentials, not only legacy API keys.

After that, **Continue with Google / Facebook / X** on `/login` and `/signup` should redirect to the provider instead of returning 400.
