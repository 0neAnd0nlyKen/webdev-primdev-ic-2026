import logger from '../configs/logger.config.js'

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const makeResponseHtml = (status, data) => {
  const body = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  return `
    <div class="response-card">
      <div class="response-header">Response: ${status}</div>
      <pre>${escapeHtml(body)}</pre>
    </div>
  `
}

export const adminPanel = (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Admin API Panel</title>
  <script src="https://unpkg.com/htmx.org@1.9.3"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f5f6fb; color: #111; }
    header { background: #1e293b; color: #fff; padding: 1.25rem; text-align: center; }
    .container { max-width: 1200px; margin: 1.5rem auto; padding: 0 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .card { background: #fff; border: 1px solid #d1d5db; border-radius: 12px; padding: 1rem; box-shadow: 0 8px 20px rgba(15, 23, 42, 0.05); }
    .card h2 { margin-top: 0; font-size: 1.1rem; }
    .field { margin-bottom: 0.9rem; }
    .field label { display: block; margin-bottom: 0.35rem; font-size: 0.92rem; }
    .field input, .field select, .field textarea { width: 100%; padding: 0.65rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 8px; }
    button { cursor: pointer; border: none; border-radius: 8px; padding: 0.85rem 1rem; background: #2563eb; color: white; width: 100%; font-weight: 600; }
    button.secondary { background: #475569; }
    .response-card { background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 1rem; margin-top: 1rem; }
    .response-header { font-weight: 700; margin-bottom: 0.75rem; }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-size: 0.85rem; }
    .section-title { margin: 0 0 0.75rem 0; font-size: 1rem; }
    .inline-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
  </style>
</head>
<body>
  <header>
    <h1>Admin API Panel</h1>
    <p>Use this page to exercise API routes and see live responses in one panel.</p>
  </header>
  <main class="container">
    <div class="grid">
      <div class="card">
        <h2>Auth</h2>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" form="login-form" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" form="login-form" />
        </div>
        <form id="login-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/auth/login" />
          <button type="submit">Login</button>
        </form>
        <hr />
        <div class="field">
          <label>Name</label>
          <input type="text" name="name" form="register-form" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" form="register-form" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" form="register-form" />
        </div>
        <form id="register-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/auth/register" />
          <button type="submit" class="secondary">Register</button>
        </form>
      </div>

      <div class="card">
        <h2>Books</h2>
        <form hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/books/" />
          <button type="submit">Get all books</button>
        </form>
        <div class="field">
          <label>Book ID</label>
          <input type="number" name="id" form="get-book-form" />
        </div>
        <form id="get-book-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/books/" />
          <button type="submit">Get book by ID</button>
        </form>
        <div class="field">
          <label>Title</label>
          <input type="text" name="title" form="create-book-form" />
        </div>
        <div class="field">
          <label>Author</label>
          <input type="text" name="author" form="create-book-form" />
        </div>
        <div class="field">
          <label>Year</label>
          <input type="number" name="year" form="create-book-form" />
        </div>
        <div class="field">
          <label>Category ID</label>
          <input type="number" name="categoryId" form="create-book-form" />
        </div>
        <form id="create-book-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/books/" />
          <button type="submit">Create book</button>
        </form>
        <div class="field">
          <label>Book ID</label>
          <input type="number" name="id" form="update-book-form" />
        </div>
        <div class="field">
          <label>Title</label>
          <input type="text" name="title" form="update-book-form" />
        </div>
        <div class="field">
          <label>Author</label>
          <input type="text" name="author" form="update-book-form" />
        </div>
        <div class="field">
          <label>Year</label>
          <input type="number" name="year" form="update-book-form" />
        </div>
        <div class="field">
          <label>Category ID</label>
          <input type="number" name="categoryId" form="update-book-form" />
        </div>
        <form id="update-book-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="PUT" />
          <input type="hidden" name="proxyPath" value="/books/" />
          <button type="submit" class="secondary">Update book</button>
        </form>
        <div class="field">
          <label>Book ID</label>
          <input type="number" name="id" form="delete-book-form" />
        </div>
        <form id="delete-book-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="DELETE" />
          <input type="hidden" name="proxyPath" value="/books/" />
          <button type="submit" class="secondary">Delete book</button>
        </form>
      </div>

      <div class="card">
        <h2>Borrowings</h2>
        <form hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/borrowings/" />
          <button type="submit">Get all borrowings</button>
        </form>
        <div class="field">
          <label>Borrowing ID</label>
          <input type="number" name="id" form="get-borrowing-form" />
        </div>
        <form id="get-borrowing-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/borrowings/" />
          <button type="submit">Get borrowing by ID</button>
        </form>
        <div class="field">
          <label>User ID</label>
          <input type="number" name="userId" form="create-borrowing-form" />
        </div>
        <div class="field">
          <label>Book ID</label>
          <input type="number" name="bookId" form="create-borrowing-form" />
        </div>
        <form id="create-borrowing-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/borrowings/" />
          <button type="submit">Create borrowing</button>
        </form>
        <div class="field">
          <label>Borrowing ID</label>
          <input type="number" name="id" form="return-borrowing-form" />
        </div>
        <form id="return-borrowing-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="PUT" />
          <input type="hidden" name="proxyPath" value="/borrowings/" />
          <input type="hidden" name="suffixPath" value="/return" />
          <button type="submit" class="secondary">Return book</button>
        </form>
        <div class="field">
          <label>Borrowing ID</label>
          <input type="number" name="id" form="delete-borrowing-form" />
        </div>
        <form id="delete-borrowing-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="DELETE" />
          <input type="hidden" name="proxyPath" value="/borrowings/" />
          <button type="submit" class="secondary">Delete borrowing</button>
        </form>
      </div>

      <div class="card">
        <h2>Categories</h2>
        <form hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/categories/" />
          <button type="submit">Get all categories</button>
        </form>
        <div class="field">
          <label>Category ID</label>
          <input type="number" name="id" form="get-category-form" />
        </div>
        <form id="get-category-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/categories/" />
          <button type="submit">Get category by ID</button>
        </form>
        <div class="field">
          <label>Name</label>
          <input type="text" name="name" form="create-category-form" />
        </div>
        <form id="create-category-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/categories/" />
          <button type="submit">Create category</button>
        </form>
        <div class="inline-grid">
          <div class="field">
            <label>Category ID</label>
            <input type="number" name="id" form="update-category-form" />
          </div>
          <div class="field">
            <label>New name</label>
            <input type="text" name="name" form="update-category-form" />
          </div>
        </div>
        <form id="update-category-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="PUT" />
          <input type="hidden" name="proxyPath" value="/categories/" />
          <button type="submit" class="secondary">Update category</button>
        </form>
        <div class="field">
          <label>Category ID</label>
          <input type="number" name="id" form="delete-category-form" />
        </div>
        <form id="delete-category-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="DELETE" />
          <input type="hidden" name="proxyPath" value="/categories/" />
          <button type="submit" class="secondary">Delete category</button>
        </form>
      </div>

      <div class="card">
        <h2>Profiles</h2>
        <form hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/profiles/" />
          <button type="submit">Get all profiles</button>
        </form>
        <div class="field">
          <label>Profile ID</label>
          <input type="number" name="id" form="get-profile-form" />
        </div>
        <form id="get-profile-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/profiles/" />
          <button type="submit">Get profile by ID</button>
        </form>
        <div class="field">
          <label>User ID</label>
          <input type="number" name="userId" form="create-profile-form" />
        </div>
        <div class="field">
          <label>Address</label>
          <input type="text" name="address" form="create-profile-form" />
        </div>
        <div class="field">
          <label>Phone</label>
          <input type="text" name="phone" form="create-profile-form" />
        </div>
        <form id="create-profile-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/profiles/" />
          <button type="submit">Create profile</button>
        </form>
        <div class="field">
          <label>Profile ID</label>
          <input type="number" name="id" form="update-profile-form" />
        </div>
        <div class="field">
          <label>Address</label>
          <input type="text" name="address" form="update-profile-form" />
        </div>
        <div class="field">
          <label>Phone</label>
          <input type="text" name="phone" form="update-profile-form" />
        </div>
        <form id="update-profile-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="PUT" />
          <input type="hidden" name="proxyPath" value="/profiles/" />
          <button type="submit" class="secondary">Update profile</button>
        </form>
        <div class="field">
          <label>Profile ID</label>
          <input type="number" name="id" form="delete-profile-form" />
        </div>
        <form id="delete-profile-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="DELETE" />
          <input type="hidden" name="proxyPath" value="/profiles/" />
          <button type="submit" class="secondary">Delete profile</button>
        </form>
      </div>

      <div class="card">
        <h2>Users</h2>
        <form hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/users/" />
          <button type="submit">Get all users</button>
        </form>
        <div class="field">
          <label>User ID</label>
          <input type="number" name="id" form="get-user-form" />
        </div>
        <form id="get-user-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="GET" />
          <input type="hidden" name="proxyPath" value="/users/" />
          <button type="submit">Get user by ID</button>
        </form>
        <div class="field">
          <label>Name</label>
          <input type="text" name="name" form="create-user-form" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" form="create-user-form" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" form="create-user-form" />
        </div>
        <div class="field">
          <label>Role</label>
          <input type="text" name="role" form="create-user-form" placeholder="USER or ADMIN" />
        </div>
        <form id="create-user-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="POST" />
          <input type="hidden" name="proxyPath" value="/users/" />
          <button type="submit">Create user</button>
        </form>
        <div class="field">
          <label>User ID</label>
          <input type="number" name="id" form="update-user-form" />
        </div>
        <div class="field">
          <label>Name</label>
          <input type="text" name="name" form="update-user-form" />
        </div>
        <div class="field">
          <label>Email</label>
          <input type="email" name="email" form="update-user-form" />
        </div>
        <div class="field">
          <label>Password</label>
          <input type="password" name="password" form="update-user-form" />
        </div>
        <div class="field">
          <label>Role</label>
          <input type="text" name="role" form="update-user-form" placeholder="USER or ADMIN" />
        </div>
        <form id="update-user-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="PUT" />
          <input type="hidden" name="proxyPath" value="/users/" />
          <button type="submit" class="secondary">Update user</button>
        </form>
        <div class="field">
          <label>User ID</label>
          <input type="number" name="id" form="delete-user-form" />
        </div>
        <form id="delete-user-form" hx-post="/admin/proxy" hx-target="#response" hx-swap="innerHTML">
          <input type="hidden" name="proxyMethod" value="DELETE" />
          <input type="hidden" name="proxyPath" value="/users/" />
          <button type="submit" class="secondary">Delete user</button>
        </form>
      </div>
    </div>
    <div id="response"></div>
  </main>
</body>
</html>
  `)
}

export const adminProxy = async (req, res) => {
  try {
    const { proxyPath, proxyMethod, suffixPath, ...rest } = req.body
    const method = proxyMethod?.toUpperCase() || 'GET'
    let path = proxyPath || '/'
    if (rest.id) {
      const idValue = rest.id
      delete rest.id
      if (path.endsWith('/')) {
        path = `${path}${idValue}`
      } else {
        path = `${path}/${idValue}`
      }
    }

    if (suffixPath) {
      path = `${path}${suffixPath}`
    }

    const headers = { Accept: 'application/json' }
    const options = { method, headers }

    if (method !== 'GET' && method !== 'DELETE') {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(rest)
    } else if (Object.keys(rest).length > 0) {
      const query = new URLSearchParams(rest).toString()
      path = query ? `${path}?${query}` : path
    }

    const host = req.get('host') || `localhost:${process.env.PORT || 3000}`
    const url = `${req.protocol}://${host}${path}`
    logger.debug({ url, method, body: rest }, 'adminProxy request')
    const apiResponse = await fetch(url, options)
    const contentType = apiResponse.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await apiResponse.json()
      : await apiResponse.text()

    logger.info({ url, status: apiResponse.status }, 'adminProxy response received')
    res.send(makeResponseHtml(apiResponse.status, data))
  } catch (error) {
    logger.error({ error: error.message }, 'adminProxy failed')
    res.send(makeResponseHtml(500, { error: error.message }))
  }
}
