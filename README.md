# my_portfolio

A static HTML/CSS/JS portfolio for M. Shahid (DevOps & Cloud Engineer) with a
built-in static admin panel for managing Projects and Skills.

## Admin Panel

- URL: `/admin/shahid/` (i.e. `admin/shahid/index.html`)
- Default password: `shahid123` (change it from the Settings tab after login)
- Lets you add/edit/delete **Projects** (image, title, description, tags,
  category, GitHub/Live links) and **Skills** (category + skill name +
  percentage). Changes render live on the main site instantly.

### How the "database" works

This project has no backend, so the admin panel stores data in the browser's
`localStorage` (see `data.js`). That means:

- Changes you make are visible immediately on the site **in the same browser**.
- They are **not** visible to other visitors, since there's no shared server.
- To make changes permanent for everyone: open Admin → Settings → **Export JSON**,
  then paste that data into `DEFAULT_PROJECTS` / `DEFAULT_SKILLS` inside
  `data.js`, commit, and redeploy (e.g. rebuild the Docker image / push to
  GitHub Pages).

## Tech / Deployment

Plain HTML/CSS/JS, served via Nginx (see `Dockerfile`). Can be containerized
and deployed to any environment — including Kubernetes (Deployment + Service +
Ingress) once you're ready, or provisioned with Terraform for the underlying
infra.

